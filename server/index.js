// =============================================================================
// FILE: server/index.js
// PURPOSE: WebSocket relay server supporting isolated "rooms." Clients
//          announce which room they belong to upon connecting; messages
//          are relayed only to other clients within that same room.
// AUTHOR: Abraham Macias
// DATE: 2026-08-17
// DEPENDENCIES: ws (npm package) — lightweight WebSocket library for Node.js
// EDGE CASES: A client that disconnects is removed from its room's client
//             set; if a room becomes empty, its entry is removed entirely
//             to avoid accumulating unused rooms in memory indefinitely.
// =============================================================================

const { WebSocketServer } = require('ws');

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

// -----------------------------------------------------------------------------
// STATE: rooms
// WHAT: Maps each room ID to the set of client connections currently in it.
// WHY IT EXISTS: Allows message relaying to be scoped per room instead of
//                broadcasting to every connected client globally.
// -----------------------------------------------------------------------------
const rooms = new Map();

// -----------------------------------------------------------------------------
// FUNCTION: addClientToRoom
// WHAT: Registers a client under the given room ID, creating the room's
//       entry if it doesn't already exist.
// WHY IT EXISTS: Centralizes room-creation logic so it only happens in one
//                place, avoiding duplicated setup code elsewhere.
// -----------------------------------------------------------------------------
function addClientToRoom(roomId, client) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(client);
}

// -----------------------------------------------------------------------------
// FUNCTION: removeClientFromRoom
// WHAT: Removes a client from its room, and deletes the room entirely if
//       it becomes empty as a result.
// WHY IT EXISTS: Prevents the server's memory from slowly filling up with
//                empty room entries as visitors come and go over time.
// -----------------------------------------------------------------------------
function removeClientFromRoom(roomId, client) {
  const roomClients = rooms.get(roomId);
  if (!roomClients) return;

  roomClients.delete(client);

  if (roomClients.size === 0) {
    rooms.delete(roomId);
  }
}

// -----------------------------------------------------------------------------
// FUNCTION: broadcastToRoom
// WHAT: Sends a message to every client in the given room except the
//       original sender.
// WHY IT EXISTS: This is the core relay behavior, now scoped to a single
//                room instead of every connected client globally.
// EDGE CASE: Checks readyState === OPEN before sending, to avoid attempting
//            delivery to a connection that is closing or already closed.
// -----------------------------------------------------------------------------
function broadcastToRoom(roomId, sendingClient, messageAsText) {
  const roomClients = rooms.get(roomId);
  if (!roomClients) return;

  roomClients.forEach((otherClient) => {
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
//       room this specific connection belongs to once it announces itself.
// WHY IT EXISTS: Registers per-connection event handlers so each client's
//                messages and disconnection are handled independently.
// EDGE CASE: A client's room is unknown until its first 'join' message
//            arrives; messages received before that are ignored.
// -----------------------------------------------------------------------------
function handleNewConnection(currentClient) {
  let currentRoomId = null;

  currentClient.on('message', (incomingMessage) => {
    const messageAsText = incomingMessage.toString();
    const parsedMessage = JSON.parse(messageAsText);

    if (parsedMessage.type === 'join') {
      currentRoomId = parsedMessage.roomId;
      addClientToRoom(currentRoomId, currentClient);
      console.log(`Client joined room "${currentRoomId}". Room size:`, rooms.get(currentRoomId).size);
      return;
    }

    if (parsedMessage.type === 'codeUpdate' && currentRoomId) {
      broadcastToRoom(currentRoomId, currentClient, messageAsText);
    }
  });

  currentClient.on('close', () => {
    if (currentRoomId) {
      removeClientFromRoom(currentRoomId, currentClient);
      console.log(`Client left room "${currentRoomId}".`);
    }
  });
}

wss.on('connection', handleNewConnection);

console.log(`WebSocket relay server is running on port ${PORT}`);