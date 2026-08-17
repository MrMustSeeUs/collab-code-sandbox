// =============================================================================
// FILE: client/src/RoomPresence.tsx
// PURPOSE: Displays the list of participants currently present in the room,
//          along with a live indicator for anyone currently typing.
// AUTHOR: Abraham Macias
// DATE: 2026-08-17
// DEPENDENCIES: React
// EDGE CASES: Renders nothing extra when the room is empty or contains only
//             the current user; the list simply reflects whatever roster
//             it receives.
// =============================================================================

import type { Participant } from './utils/useRoomConnection';

// -----------------------------------------------------------------------------
// TYPE: RoomPresenceProps
// WHAT: The properties this component accepts from its parent.
// -----------------------------------------------------------------------------
type RoomPresenceProps = {
    participants: Participant[];
};

// -----------------------------------------------------------------------------
// COMPONENT: RoomPresence
// WHAT: Renders a simple list of current room participants and their
//       typing status.
// WHY IT EXISTS: Gives users visibility into who else is present, which is
//                essential for a collaborative tool to feel genuinely
//                multiplayer rather than opaque.
// -----------------------------------------------------------------------------
function RoomPresence({ participants }: RoomPresenceProps) {
    return (
        <aside className="room-presence">
            <h2 className="room-presence-heading">In this room</h2>
            <ul className="room-presence-list">
                {participants.map((participant) => (
                    <li key={participant.clientId} className="room-presence-item">
                        <span>{participant.username}</span>
                        {participant.isTyping && (
                            <span className="typing-indicator">typing…</span>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default RoomPresence;