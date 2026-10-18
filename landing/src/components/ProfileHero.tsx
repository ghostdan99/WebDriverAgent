import {useEffect, useState} from 'react';
import {COPY} from '../config/copy';
import {PROFILE} from '../config/profile';
import {useRegistration} from '../context/registration';
import type {Presence} from '../lib/availability';
import {shareLink} from '../lib/share';
import {AffiliateLink} from './AffiliateLink';
import {CheckIcon, LockIcon, PinIcon, PlusIcon, ShareIcon, VerifiedIcon} from './Icons';
import {ProfileBio} from './ProfileBio';
import {ProfileStats} from './ProfileStats';
import styles from './ProfileHero.module.css';

const STATUS_DELAY_MS = 1200;

interface ProfileHeroProps {
  // False while the age gate is still covering the page; the status reveal waits for it.
  active: boolean;
  presence: Presence;
  onNotify: (message: string) => void;
}

export function ProfileHero({active, presence, onNotify}: ProfileHeroProps) {
  const openRegistration = useRegistration();
  const [statusShown, setStatusShown] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    const id = window.setTimeout(() => setStatusShown(true), STATUS_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [active]);

  const share = async () => {
    const result = await shareLink({
      title: `${PROFILE.name} (@${PROFILE.handle})`,
      text: PROFILE.tagline,
      url: window.location.href,
    });
    if (result === 'copied') {
      onNotify('Profile link copied');
    } else if (result === 'failed') {
      onNotify('Sharing is not available. Copy the address from your browser.');
    }
  };

  return (
    <section className={styles.hero} aria-labelledby="profile-name">
      <div className={styles.cover}>
        <img
          src={PROFILE.cover.src}
          alt={PROFILE.cover.alt}
          width={1600}
          height={640}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className={styles.body}>
        <div className={styles.identityRow}>
          <div className={styles.avatarWrap}>
            <img
              className={styles.avatar}
              src={PROFILE.avatar.src}
              alt={PROFILE.avatar.alt}
              width={160}
              height={160}
              fetchPriority="high"
              decoding="async"
            />
            {presence.available && (
              <span
                className={styles.presence}
                data-visible={statusShown || undefined}
                aria-hidden="true"
              />
            )}
          </div>
          <div className={styles.quickActions}>
            <button type="button" className="icon-btn" aria-label="Share profile" onClick={share}>
              <ShareIcon size={19} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => openRegistration('follow')}
            >
              <PlusIcon size={17} />
              Follow
            </button>
          </div>
        </div>

        <h1 id="profile-name" className={styles.name}>
          {PROFILE.name}
          {PROFILE.verified && (
            <span className={styles.verified}>
              <VerifiedIcon size={24} />
              <span className="sr-only">Verified profile</span>
            </span>
          )}
        </h1>

        <div className={styles.meta}>
          <span className={styles.handle}>@{PROFILE.handle}</span>
          {PROFILE.location && (
            <span className={styles.location}>
              <PinIcon size={16} />
              <span className="sr-only">Location: </span>
              {PROFILE.location}
            </span>
          )}
          {presence.label && (
            <span
              className={styles.status}
              data-online={presence.available || undefined}
              data-visible={statusShown || undefined}
            >
              <span className={styles.statusDot} aria-hidden="true" />
              {presence.label}
            </span>
          )}
        </div>

        <ProfileBio />

        <ProfileStats />

        <div className={styles.cta}>
          <AffiliateLink
            placement="hero_unlock"
            intent="join"
            className={`btn btn-primary ${styles.ctaButton}`}
            icon={<LockIcon size={18} />}
          >
            {COPY.unlockProfile}
          </AffiliateLink>
          <p className={styles.ctaNote}>
            <CheckIcon size={16} />
            {COPY.signupNote}
          </p>
        </div>
      </div>
    </section>
  );
}
