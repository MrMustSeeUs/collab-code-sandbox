// =============================================================================
// FILE: server/index.js
// PURPOSE: WebSocket relay server supporting isolated rooms with live
//          presence. Tracks which users are in each room and who is
//          currently typing, broadcasting updates whenever that state
//          changes so every client can render an accurate roster.
// AUTHOR: Abraham Macias
// DATE: 2026-08-17
// DEPENDENCIES: ws (npm package) — lightweight WebSocket library for Node.js
// EDGE CASES: A client that disconnects without explicitly leaving is still
//             cleanly removed via the 'close' event, so the roster never
//             shows a "ghost" user. If a room becomes empty, its entry is
//             removed entirely to avoid accumulating unused rooms.
// =============================================================================

const { WebSocketServer } = require('ws');

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

// -----------------------------------------------------------------------------
// STATE: rooms
// WHAT: Maps each room ID to a Map of client connection -> participant info
//       (username, and whether they are currently typing).
// WHY IT EXISTS: A Map (rather than a Set) lets us associate metadata with
//                each connection, which a bare Set of connections could not.
// -----------------------------------------------------------------------------
const rooms = new Map();
let nextClientId = 1;

// -----------------------------------------------------------------------------
// FUNCTION: addClientToRoom
// WHAT: Registers a client under the given room ID with their username,
//       creating the room's entry if it doesn't already exist.
// WHY IT EXISTS: Centralizes room-creation and participant registration.
// -----------------------------------------------------------------------------
function addClientToRoom(roomId, client, username) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
    }
    const clientId = nextClientId++;
    rooms.get(roomId).set(client, { clientId, username, isTyping: false });
}
// -----------------------------------------------------------------------------
// FUNCTION: removeClientFromRoom
// WHAT: Removes a client from its room, deleting the room entirely if it
//       becomes empty as a result.
// WHY IT EXISTS: Prevents memory from slowly filling with empty rooms.
// -----------------------------------------------------------------------------
function removeClientFromRoom(roomId, client) {
    const roomParticipants = rooms.get(roomId);
    if (!roomParticipants) return;

    roomParticipants.delete(client);

    if (roomParticipants.size === 0) {
        rooms.delete(roomId);
    }
}

// -----------------------------------------------------------------------------
// FUNCTION: broadcastRoomState
// WHAT: Sends the full current roster (usernames and typing status) for a
//       room to every client currently in that room, including the sender.
// WHY IT EXISTS: Keeps every participant's view of "who's here and who's
//                typing" in sync after any join, leave, or typing change.
// EDGE CASE: Unlike code-update relaying, this intentionally includes the
//            sender, since the sender also needs to see the updated roster.
// -----------------------------------------------------------------------------
function broadcastRoomState(roomId) {
    const roomParticipants = rooms.get(roomId);
    if (!roomParticipants) return;

    const participantList = Array.from(roomParticipants.values()).map(
        (participant) => ({
            clientId: participant.clientId,
            username: participant.username,
            isTyping: participant.isTyping,
        })
    );

    const roomStateMessage = JSON.stringify({
        type: 'roomState',
        participants: participantList,
    });

    roomParticipants.forEach((_participantInfo, client) => {
        if (client.readyState === client.OPEN) {
            client.send(roomStateMessage);
        }
    });
}

// -----------------------------------------------------------------------------
// FUNCTION: broadcastToRoom
// WHAT: Sends a message to every client in the given room except the
//       original sender. Used for code content updates only.
// WHY IT EXISTS: Core relay behavior, scoped to a single room.
// -----------------------------------------------------------------------------
function broadcastToRoom(roomId, sendingClient, messageAsText) {
    const roomParticipants = rooms.get(roomId);
    if (!roomParticipants) return;

    roomParticipants.forEach((_participantInfo, otherClient) => {
        const isNotTheSender = otherClient !== sendingClient;
        const isStillConnected = otherClient.readyState === otherClient.OPEN;

        if (isNotTheSender && isStillConnected) {
            otherClient.send(messageAsText);
        }
    });
}

// -----------------------------------------------------------------------------
// FUNCTION: handleNewConnection
// WHAT: Runs automatically each time a new client connects. Tracks which
//       room and username this connection belongs to once it announces
//       itself, and handles code updates, typing status, and disconnection.
// WHY IT EXISTS: Central per-connection event routing.
// -----------------------------------------------------------------------------
function handleNewConnection(currentClient) {
    let currentRoomId = null;

    currentClient.on('message', (incomingMessage) => {
        const messageAsText = incomingMessage.toString();
        const parsedMessage = JSON.parse(messageAsText);

        if (parsedMessage.type === 'join') {
            currentRoomId = parsedMessage.roomId;
            addClientToRoom(currentRoomId, currentClient, parsedMessage.username);
            broadcastRoomState(currentRoomId);
            return;
        }

        if (parsedMessage.type === 'codeUpdate' && currentRoomId) {
            broadcastToRoom(currentRoomId, currentClient, messageAsText);
            return;
        }

        if (parsedMessage.type === 'typing' && currentRoomId) {
            const roomParticipants = rooms.get(currentRoomId);
            const participantInfo = roomParticipants?.get(currentClient);
            if (participantInfo) {
                participantInfo.isTyping = parsedMessage.isTyping;
                broadcastRoomState(currentRoomId);
            }
        }
    });

    currentClient.on('close', () => {
        if (currentRoomId) {
            removeClientFromRoom(currentRoomId, currentClient);
            broadcastRoomState(currentRoomId);
        }
    });
}

wss.on('connection', handleNewConnection);

console.log(`WebSocket relay server is running on port ${PORT}`);