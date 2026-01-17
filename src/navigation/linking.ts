import * as Linking from 'expo-linking';
import { ROUTES } from './types';

// The prefix for deep links (custom URL scheme)
const prefix = Linking.createURL('/');

// Linking configuration for React Navigation
export const linking = {
    prefixes: [
        prefix,
        'sportmap://',
        'https://ujfeqshqhlplmolfrlvc.supabase.co',
    ],
    config: {
        screens: {
            // Auth flow
            [ROUTES.WELCOME]: 'welcome',
            [ROUTES.AUTH]: 'auth',
            [ROUTES.REGISTER]: 'register',
            [ROUTES.RESET_PASSWORD]: 'reset-password',

            // Main app
            [ROUTES.MAP]: 'map',
            [ROUTES.PROFILE]: 'profile/:userId?',
            [ROUTES.EVENT_DETAILS]: 'event/:eventId',
            [ROUTES.GROUP_DETAILS]: 'group/:groupId',
            [ROUTES.NOTIFICATIONS]: 'notifications',
            [ROUTES.SETTINGS]: 'settings',
        },
    },
};

export default linking;
