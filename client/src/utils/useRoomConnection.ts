// =============================================================================
// FILE: client/src/utils/useRoomConnection.ts
// PURPOSE: Custom React hook that owns the single WebSocket connection for
//          a room. Centralizes joining, sending code updates, sending
//          typing status, and receiving room state, so multiple components
//          (the editor and the presence list) can share one connection
//          instead of each opening their own.
// AUTHOR: Abraham Macias
// DATE: 2026-08-17
// DEPENDENCIES: React (useState, useEffect, useRef, useCallback)
// EDGE CASES: Typing status is automatically cleared after a period of
//             inactivity, so a user who stops typing without further
//             action doesn't appear "stuck" as typing indefinitely.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';

const SERVER_URL = 'ws://localhost:8080';
const TYPING_TIMEOUT_MS = 1500;

// -----------------------------------------------------------------------------
// TYPE: Participant
// WHAT: Describes one person currently present in the room.
// -----------------------------------------------------------------------------
export type Participant = {
    clientId: number;
    username: string;
    isTyping: boolean;
};

// -----------------------------------------------------------------------------
// HOOK: useRoomConnection
// WHAT: Establishes and manages the WebSocket connection for a given room
//       and username. Returns the current shared code text, the current
//       participant roster, and functions to update text or typing status.
// WHY IT EXISTS: Single source of truth for real-time room state, shared
//                across any component that needs it.
// EDGE CASE: The connection is opened once per (roomId, username) pair and
//            cleanly closed on unmount, preventing duplicate or orphaned
//            connections.
// -----------------------------------------------------------------------------
export function useRoomConnection(roomId: string, username: string) {
    const [codeText, setCodeText] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const socket = new WebSocket(SERVER_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'join', roomId, username }));
        };

        socket.onmessage = (event) => {
            const parsedMessage = JSON.parse(event.data);

            if (parsedMessage.type === 'codeUpdate') {
                setCodeText(parsedMessage.text);
            }

            if (parsedMessage.type === 'roomState') {
                setParticipants(parsedMessage.participants);
            }
        };

        return () => {
            socket.close();
        };
    }, [roomId, username]);

    // ---------------------------------------------------------------------------
    // FUNCTION: sendCodeUpdate
    // WHAT: Updates local text immediately and broadcasts it to the room.
    // WHY IT EXISTS: Exposed to the editor component as the single entry
    //                point for reporting a text change.
    // ---------------------------------------------------------------------------
    const sendCodeUpdate = useCallback((newText: string) => {
        setCodeText(newText);

        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'codeUpdate', roomId, text: newText, username }));
        }
    }, [roomId, username]);

    // ---------------------------------------------------------------------------
    // FUNCTION: reportTypingActivity
    // WHAT: Notifies the server that this user is actively typing, and
    //       automatically reports "stopped typing" after a period of
    //       inactivity with no further calls to this function.
    // WHY IT EXISTS: Implements the standard debounced typing-indicator
    //                pattern without requiring a real "stopped typing"
    //                browser event, which does not exist.
    // EDGE CASE: Each call resets the inactivity timer, so continuous typing
    //            never triggers a premature "stopped" notification.
    // ---------------------------------------------------------------------------
    const reportTypingActivity = useCallback(() => {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        socket.send(JSON.stringify({ type: 'typing', isTyping: true }));

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.send(JSON.stringify({ type: 'typing', isTyping: false }));
        }, TYPING_TIMEOUT_MS);
    }, []);

    return { codeText, participants, sendCodeUpdate, reportTypingActivity };
}