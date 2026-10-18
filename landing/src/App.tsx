import {useCallback, useEffect, useRef, useState} from 'react';
import styles from './App.module.css';
import {AGE_GATE_STORAGE_KEY, AgeGate, isAgeConfirmed} from './components/AgeGate';
import {ChatWidget} from './components/ChatWidget';
import {ContentTabs} from './components/ContentTabs';
import {FloatingChatButton} from './components/FloatingChatButton';
import {Footer} from './components/Footer';
import {Header} from './components/Header';
import {LatestPosts} from './components/LatestPosts';
import {LockedContentModal} from './components/LockedContentModal';
import {ProfileHero} from './components/ProfileHero';
import {Toast} from './components/Toast';
import {PROFILE} from './config/profile';
import {RegistrationContext} from './context/registration';
import {usePresence} from './hooks/usePresence';
import {useInView} from './hooks/useInView';
import {isPlaceholderAffiliateUrl} from './lib/affiliate';
import {initAnalytics, type RegistrationReason, track} from './lib/analytics';
import {readStorage, writeStorage} from './lib/storage';

export function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(() => isAgeConfirmed(readStorage));
  const [reason, setReason] = useState<RegistrationReason | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const presence = usePresence(PROFILE.availability);
  const chatRef = useRef<HTMLElement>(null);
  const chatInView = useInView(chatRef, '0px 0px -80px 0px');
  const viewTracked = useRef(false);

  useEffect(() => {
    initAnalytics();
    if (import.meta.env.DEV && import.meta.env.MODE !== 'test' && isPlaceholderAffiliateUrl()) {
      console.warn(
        '[affiliate] AFFILIATE_URL is still the placeholder. Set it in src/config/affiliate.ts.',
      );
    }
  }, []);

  useEffect(() => {
    if (ageConfirmed && !viewTracked.current) {
      viewTracked.current = true;
      track('profile_view', {profile: PROFILE.handle});
    }
  }, [ageConfirmed]);

  const openRegistration = useCallback((next: RegistrationReason) => {
    setReason(next);
    track('registration_modal_view', {reason: next});
  }, []);

  const closeRegistration = useCallback(() => setReason(null), []);
  const clearToast = useCallback(() => setToast(null), []);

  const confirmAge = () => {
    writeStorage(AGE_GATE_STORAGE_KEY, String(Date.now()));
    setAgeConfirmed(true);
  };

  return (
    <RegistrationContext value={openRegistration}>
      <a href="#main" className="skip-link">
        Skip to profile
      </a>
      <Header />

      <main id="main" className="container">
        <ProfileHero active={ageConfirmed} presence={presence} onNotify={setToast} />

        <div className={styles.layout}>
          <div className={styles.feed}>
            <LatestPosts />
            <ContentTabs />
          </div>
          <section ref={chatRef} id="chat" className={styles.chat} aria-labelledby="chat-title">
            <div className="section-head">
              <div>
                <h2 id="chat-title" className="section-title">
                  Messages
                </h2>
                <p className="section-sub">Say hi to {PROFILE.name.split(' ')[0]}</p>
              </div>
            </div>
            <ChatWidget presence={presence} />
          </section>
        </div>
      </main>

      <Footer />

      <FloatingChatButton presence={presence} hidden={!ageConfirmed || chatInView} />
      <LockedContentModal reason={reason} onClose={closeRegistration} />
      <AgeGate open={!ageConfirmed} onConfirm={confirmAge} />
      <Toast message={toast} onDone={clearToast} />
    </RegistrationContext>
  );
}
