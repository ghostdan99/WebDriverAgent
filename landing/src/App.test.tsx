import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {App} from './App';
import {AGE_GATE_STORAGE_KEY} from './components/AgeGate';
import {AFFILIATE_URL} from './config/affiliate';
import {COPY} from './config/copy';
import {PROFILE} from './config/profile';
import {type AnalyticsEventName, onTrack} from './lib/analytics';

let events: Array<{name: AnalyticsEventName; params: unknown}> = [];
let stopTracking: () => void;

// 20:30 in Lisbon on a Monday: inside the sample profile's evening availability window.
const IN_WINDOW = new Date('2026-10-19T19:30:00Z');

beforeEach(() => {
  events = [];
  stopTracking = onTrack((name, params) => events.push({name, params}));
  // Only Date is faked, so status labels are deterministic while timers and user events run normally.
  vi.useFakeTimers({toFake: ['Date']});
  vi.setSystemTime(IN_WINDOW);
});

afterEach(() => {
  stopTracking();
  vi.useRealTimers();
});

const eventNames = () => events.map((e) => e.name);

function renderPastGate() {
  window.localStorage.setItem(AGE_GATE_STORAGE_KEY, String(Date.now()));
  const user = userEvent.setup();
  render(<App />);
  return user;
}

const waitForNoDialog = () =>
  waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

describe('age gate', () => {
  it('blocks the profile until the visitor confirms their age', async () => {
    const user = userEvent.setup();
    render(<App />);
    const gate = screen.getByRole('dialog', {name: 'Adults only'});
    expect(eventNames()).not.toContain('profile_view');

    await user.keyboard('{Escape}');
    expect(gate).toBeInTheDocument();

    await user.click(within(gate).getByRole('button', {name: /18 or older/}));
    await waitForNoDialog();
    expect(window.localStorage.getItem(AGE_GATE_STORAGE_KEY)).not.toBeNull();
    expect(eventNames()).toContain('profile_view');
  });
});

describe('profile', () => {
  it('reveals "Available now" shortly after load', async () => {
    renderPastGate();
    const status = screen.getAllByText('Available now')[0]!;
    expect(status).toHaveAttribute('data-online');
    expect(status).not.toHaveAttribute('data-visible');
    await waitFor(() => expect(status).toHaveAttribute('data-visible'), {timeout: 2500});
  });

  it('shows when the creator was last active outside the available hours', () => {
    // 14:35 in Lisbon, 95 minutes after the 10:00-13:00 window ended.
    vi.setSystemTime(new Date('2026-10-19T13:35:00Z'));
    renderPastGate();
    const hero = screen.getByRole('region', {name: PROFILE.name});
    const status = within(hero).getByText('Active 1 h ago');
    expect(status).not.toHaveAttribute('data-online');
    expect(screen.queryByText('Available now')).not.toBeInTheDocument();
  });

  it('expands and collapses the bio under the name', async () => {
    const user = renderPastGate();
    const hero = screen.getByRole('region', {name: PROFILE.name});
    expect(within(hero).getByText(PROFILE.tagline)).toBeInTheDocument();
    const toggle = within(hero).getByRole('button', {name: 'Read more'});
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveTextContent('Show less');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(eventNames()).toContain('bio_expand');
    await user.click(toggle);
    expect(toggle).toHaveTextContent('Read more');
  });

  it('copies the profile link when native sharing is unavailable', async () => {
    const user = renderPastGate();
    await user.click(screen.getByRole('button', {name: 'Share profile'}));
    expect(await screen.findByText('Profile link copied')).toBeInTheDocument();
    await expect(navigator.clipboard.readText()).resolves.toBe(window.location.href);
  });

  it('shows the location and the free registration note in the profile header', () => {
    renderPastGate();
    const hero = screen.getByRole('region', {name: PROFILE.name});
    expect(within(hero).getByText(PROFILE.location, {exact: false})).toBeInTheDocument();
    expect(within(hero).getByText(COPY.signupNote)).toBeInTheDocument();
    expect(within(hero).getByRole('link', {name: COPY.unlockProfile})).toBeInTheDocument();
    expect(screen.queryByRole('region', {name: 'About me'})).not.toBeInTheDocument();
  });

  it('does not show a verification badge for an unverified profile', () => {
    renderPastGate();
    expect(screen.queryByText('Verified profile')).not.toBeInTheDocument();
  });
});

describe('locked content', () => {
  it('opens the registration modal, closes with Escape and returns focus', async () => {
    const user = renderPastGate();
    const tile = screen.getByRole('button', {name: /Golden hour on the rooftop/});
    await user.click(tile);

    const dialog = screen.getByRole('dialog', {name: 'This content is locked'});
    expect(within(dialog).getByRole('link', {name: COPY.createAccount})).toBeInTheDocument();
    expect(within(dialog).getByRole('link', {name: 'Log in'})).toBeInTheDocument();
    expect(eventNames()).toEqual(
      expect.arrayContaining(['locked_content_click', 'registration_modal_view']),
    );
    expect(document.documentElement.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    await waitForNoDialog();
    expect(tile).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('keeps keyboard focus inside the modal', async () => {
    const user = renderPastGate();
    await user.click(screen.getByRole('button', {name: /Morning light in Lisbon/}));
    const dialog = screen.getByRole('dialog');
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('closes when the backdrop is clicked and via the close button', async () => {
    const user = renderPastGate();
    await user.click(screen.getByRole('button', {name: /Morning light in Lisbon/}));
    await user.click(screen.getByRole('dialog').parentElement!);
    await waitForNoDialog();

    await user.click(screen.getByRole('button', {name: /Morning light in Lisbon/}));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', {name: 'Close'}));
    await waitForNoDialog();
  });

  it('switches between photos and videos with the mouse and the keyboard', async () => {
    const user = renderPastGate();
    const photos = screen.getByRole('tab', {name: /Photos/});
    const videos = screen.getByRole('tab', {name: /Videos/});
    expect(photos).toHaveAttribute('aria-selected', 'true');

    await user.click(videos);
    expect(videos).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel');
    expect(
      within(panel).getByRole('button', {name: /Get ready with me, locked video, 6:12/}),
    ).toBeInTheDocument();
    expect(events.find((e) => e.name === 'gallery_tab_change')?.params).toEqual({tab: 'videos'});

    await user.keyboard('{ArrowLeft}');
    expect(photos).toHaveAttribute('aria-selected', 'true');
    expect(photos).toHaveFocus();

    await user.click(videos);
    await user.click(
      within(screen.getByRole('tabpanel')).getByRole('button', {name: /Shoot day vlog/}),
    );
    expect(screen.getByRole('dialog', {name: 'This content is locked'})).toBeInTheDocument();
  });
});

describe('chat', () => {
  it('opens the registration modal on Enter without sending anything over the network', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = renderPastGate();
    const chat = screen.getByRole('region', {name: 'Messages'});
    const input = within(chat).getByRole('textbox', {name: /Message to/});
    const send = within(chat).getByRole('button', {name: 'Send message'});
    expect(send).toBeDisabled();

    await user.type(input, 'Hello{Shift>}{Enter}{/Shift}there');
    expect(input).toHaveValue('Hello\nthere');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog', {name: /Chat with .* on/});
    expect(within(dialog).getByRole('link', {name: COPY.registerToChat})).toBeInTheDocument();
    expect(within(dialog).getByRole('link', {name: 'Log in'})).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    const chatEvents = events.filter((e) => e.name === 'chat_attempt');
    expect(chatEvents).toEqual([{name: 'chat_attempt', params: {source: 'inline'}}]);
    expect(JSON.stringify(events)).not.toContain('Hello');
    fetchSpy.mockRestore();
  });

  it('opens a mini chat panel from the floating button', async () => {
    const user = renderPastGate();
    const fab = screen.getByRole('button', {name: /^Chat with/});
    await user.click(fab);
    const panel = screen.getByRole('dialog', {name: /^Chat with/});
    const input = within(panel).getByRole('textbox');
    expect(input).toHaveFocus();

    await user.type(input, 'hi');
    await user.click(within(panel).getByRole('button', {name: 'Send message'}));
    expect(screen.getByRole('dialog', {name: /Chat with .* on/})).toBeInTheDocument();
    expect(events.filter((e) => e.name === 'chat_attempt').at(-1)?.params).toEqual({
      source: 'floating',
    });

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', {name: /Chat with .* on/})).not.toBeInTheDocument(),
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: /^Chat with/})).toHaveFocus();
  });

  it('routes Follow to the registration modal instead of faking a local follow', async () => {
    const user = renderPastGate();
    await user.click(screen.getByRole('button', {name: 'Follow'}));
    expect(screen.getByRole('dialog', {name: /^Follow .* on/})).toBeInTheDocument();
  });
});

describe('affiliate links', () => {
  it('every sign-up and log-in link uses the single configured AFFILIATE_URL', async () => {
    const user = renderPastGate();
    // Open a modal so its links are rendered too.
    await user.click(screen.getByRole('button', {name: /Morning light in Lisbon/}));

    const links = document.querySelectorAll<HTMLAnchorElement>('a[data-affiliate-placement]');
    const placements = [...links].map((a) => a.dataset.affiliatePlacement);
    expect(placements).toEqual(
      expect.arrayContaining([
        'header_login',
        'header_join',
        'hero_unlock',
        'posts_see_all',
        'media_join',
        'modal_photo_join',
        'modal_photo_login',
      ]),
    );
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(AFFILIATE_URL);
      expect(link.rel).toContain('sponsored');
    }

    // No other outgoing links sneak in besides the configured affiliate link.
    const external = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')].filter(
      (a) => !a.dataset.affiliatePlacement,
    );
    expect(external).toEqual([]);
  });

  it('tracks CTA clicks with their placement', async () => {
    const user = renderPastGate();
    const join = screen.getByRole('link', {name: COPY.join});
    join.addEventListener('click', (e) => e.preventDefault());
    await user.click(join);
    expect(events).toContainEqual({
      name: 'affiliate_cta_click',
      params: {placement: 'header_join', intent: 'join'},
    });
    expect(join).toHaveAttribute('aria-busy', 'true');
  });
});
