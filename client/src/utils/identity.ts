// =============================================================================
// FILE: client/src/utils/identity.ts
// PURPOSE: Determines the current session's room identifier and username.
//          Room identifiers come from the URL so a shared link places every
//          visitor into the same room. Usernames persist in the browser's
//          local storage so a returning visitor keeps the same identity
//          until their browser storage is cleared.
// AUTHOR: Abraham Macias
// DATE: 2026-08-14
// DEPENDENCIES: None (browser localStorage and URL APIs only)
// EDGE CASES: If localStorage is unavailable (some private-browsing modes
//             restrict it), a fresh username is generated for that session
//             only, rather than throwing an error.
// =============================================================================

const ROOM_QUERY_PARAM = 'room';
const USERNAME_STORAGE_KEY = 'collab-sandbox-username';

const ADJECTIVES = [
    'Swift', 'Clever', 'Quiet', 'Bold', 'Bright', 'Sneaky', 'Curious', 'Calm',
    'Fuzzy', 'Nimble', 'Witty', 'Brave', 'Lucky', 'Gentle', 'Sharp',
];

const NOUNS = [
    'Falcon', 'Otter', 'Panther', 'Sparrow', 'Fox', 'Wolf', 'Badger', 'Heron',
    'Lynx', 'Raven', 'Tiger', 'Dolphin', 'Hawk', 'Wren', 'Puma',
];

// -----------------------------------------------------------------------------
// FUNCTION: generateRandomId
// WHAT: Produces a short, URL-safe random string.
// WHY IT EXISTS: Shared building block for room IDs and fallback usernames.
// -----------------------------------------------------------------------------
function generateRandomId(length: number): string {
    return Math.random().toString(36).substring(2, 2 + length);
}

// -----------------------------------------------------------------------------
// FUNCTION: getOrCreateRoomId
// WHAT: Reads the room ID from the current URL's query string. If none is
//       present, generates one and writes it back into the URL.
// WHY IT EXISTS: Lets a shared link place every visitor in the same room,
//                while still giving first-time visitors a room automatically.
// EDGE CASE: Uses history.replaceState (not pushState) so the auto-generated
//            room doesn't create an extra entry in the browser's back button
//            history.
// -----------------------------------------------------------------------------
export function getOrCreateRoomId(): string {
    const url = new URL(window.location.href);
    const existingRoomId = url.searchParams.get(ROOM_QUERY_PARAM);

    if (existingRoomId) {
        return existingRoomId;
    }

    const newRoomId = generateRandomId(8);
    url.searchParams.set(ROOM_QUERY_PARAM, newRoomId);
    window.history.replaceState({}, '', url.toString());

    return newRoomId;
}

// -----------------------------------------------------------------------------
// FUNCTION: getOrCreateUsername
// WHAT: Reads a previously assigned username from local storage. If none
//       exists, generates a random "Adjective Noun" pairing and saves it.
// WHY IT EXISTS: Gives each visitor a consistent, human-readable identity
//                across visits without requiring any sign-up or login.
// EDGE CASE: Falls back to a non-persisted random username if localStorage
//            throws, so the app still works in restrictive browser modes.
// -----------------------------------------------------------------------------
export function getOrCreateUsername(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const fallbackUsername = `${adjective} ${noun}`;

    try {
        const storedUsername = window.localStorage.getItem(USERNAME_STORAGE_KEY);
        if (storedUsername) {
            return storedUsername;
        }

        window.localStorage.setItem(USERNAME_STORAGE_KEY, fallbackUsername);
        return fallbackUsername;
    } catch {
        return fallbackUsername;
    }
}