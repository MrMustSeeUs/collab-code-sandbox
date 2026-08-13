// =============================================================================
// FILE: server/index.js
// PURPOSE: Minimal WebSocket relay server. Accepts connections from browser
//          clients and forwards any message received from one client to every
//          other connected client — the "relay" that powers real-time
//          collaborative editing between multiple people.
// AUTHOR: Abraham Macias
// DATE: 2026-08-08
// DEPENDENCIES: ws (npm package) — lightweight WebSocket library for Node.js
// EDGE CASES: If a client disconnects mid-message, the 'close' event handler
//             below ensures we don't attempt to send data to a dead connection.
// =============================================================================

// Import the WebSocketServer class from the 'ws' library. This gives us the
// server-side capability to accept and manage incoming WebSocket connections.
const { WebSocketServer } = require('ws');

// -----------------------------------------------------------------------------
// CONFIGURATION
// A named constant is used instead of a hardcoded number so the port only
// needs to be changed in one place if it's ever reassigned.
// -----------------------------------------------------------------------------
const PORT = 8080;

// -----------------------------------------------------------------------------
// Create the WebSocket server and bind it to the configured port. Once this
// runs, the process actively listens for incoming client connections.
// -----------------------------------------------------------------------------
const wss = new WebSocketServer({ port: PORT });

// -----------------------------------------------------------------------------
// FUNCTION: handleNewConnection
// WHAT: Runs automatically each time a new client connects.
// WHY IT EXISTS: Registers per-connection event handlers so each client's
//                messages and disconnection are handled independently.
// EDGE CASE: Each connected client receives its own isolated set of handlers;
//            one client's events never affect another's.
// -----------------------------------------------------------------------------
function handleNewConnection(currentClient) {
    console.log('A new client connected. Total clients:', wss.clients.size);

    currentClient.on('message', (incomingMessage) => {
        broadcastToOthers(currentClient, incomingMessage);
    });

    currentClient.on('close', () => {
        console.log('A client disconnected. Total clients:', wss.clients.size);
    });
}

// -----------------------------------------------------------------------------
// FUNCTION: broadcastToOthers
// WHAT: Forwards an incoming message to every connected client except the
//       original sender.
// WHY IT EXISTS: This is the core relay behavior that synchronizes state
//                across all connected clients in real time.
// EDGE CASE: Checks readyState === OPEN before sending, to avoid attempting
//            delivery to a connection that is closing or already closed,
//            which would otherwise throw an error.
// -----------------------------------------------------------------------------
function broadcastToOthers(sendingClient, message) {
    // Convert the incoming buffer to a proper text string before relaying.
    // Without this, receiving clients get raw binary data (a Blob) instead
    // of the readable text that was originally sent.
    const messageAsText = message.toString();

    wss.clients.forEach((otherClient) => {
        const isNotTheSender = otherClient !== sendingClient;
        const isStillConnected = otherClient.readyState === otherClient.OPEN;

        if (isNotTheSender && isStillConnected) {
            otherClient.send(messageAsText);
        }
    });
}

// -----------------------------------------------------------------------------
// Register the connection handler so every new client is routed through
// handleNewConnection automatically.
// -----------------------------------------------------------------------------
wss.on('connection', handleNewConnection);

console.log(`WebSocket relay server is running on port ${PORT}`);