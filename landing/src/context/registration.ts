import {createContext, useContext} from 'react';
import type {RegistrationReason} from '../lib/analytics';

export type OpenRegistration = (reason: RegistrationReason) => void;

export const RegistrationContext = createContext<OpenRegistration>(() => {});

/** Opens the "create an account on the platform" modal from anywhere in the page. */
export const useRegistration = () => useContext(RegistrationContext);
