import {SITE} from './site';

// CTA wording in one place, so "free" is only promised when config/site.ts says it is.
const free = SITE.freeSignup;

export const COPY = {
  join: free ? 'Join free' : 'Join',
  createAccount: free ? 'Create free account' : 'Create account',
  registerToChat: free ? 'Register free to chat' : 'Register to chat',
  joinToView: free ? 'Join free to view' : 'Join to view',
  unlockProfile: SITE.freeUnlock ? 'Unlock full profile for free' : 'Unlock full profile',
  signupNote: free ? 'Registration is free' : `Account on ${SITE.platformName} required`,
  anAccount: free ? 'a free account' : 'an account',
  forFree: SITE.freeUnlock ? ' for free' : '',
  chatNote: free ? 'Free registration required to chat' : `Chat happens on ${SITE.platformName}`,
};
