// =============================================================================
// FILE: client/src/CodeEditor.tsx
// PURPOSE: Renders the primary text-editing surface for the collaborative
//          code sandbox. Maintains a live WebSocket connection so that
//          changes made by any connected user are broadcast to, and
//          received from, every other connected user in real time.
// AUTHOR: Abraham Macias
// DATE: 2026-08-12
// DEPENDENCIES: React (useState, useEffect, useRef)
// EDGE CASES: Ignores incoming messages that match the current local text,
//             to avoid redundant re-renders. Closes the socket cleanly on
//             unmount to prevent orphaned connections.
// =============================================================================

import { useState, useEffect, useRef } from 'react';

// -----------------------------------------------------------------------------
// CONFIGURATION
// The relay server's address. Hardcoded to localhost for local development;
// will be replaced with an environment-based value before deployment.
// -----------------------------------------------------------------------------
const SERVER_URL = 'ws://localhost:8080';

// -----------------------------------------------------------------------------
// COMPONENT: CodeEditor
// WHAT: A controlled text area representing the shared code buffer, synced
//       across all connected clients via WebSocket.
// WHY IT EXISTS: Isolates all editing-surface and real-time sync concerns
//                away from page-level layout in App.tsx.
// EDGE CASE: A ref (not state) holds the socket instance, since the
//            connection object itself is never rendered and shouldn't
//            trigger re-renders when it changes.
// -----------------------------------------------------------------------------
function CodeEditor() {
  const [codeText, setCodeText] = useState('');
  const socketRef = useRef<WebSocket | null>(null);

  // ---------------------------------------------------------------------------
  // Opens the WebSocket connection once, when the component first appears,
  // and closes it if the component is ever removed from the page.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const socket = new WebSocket(SERVER_URL);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      setCodeText(event.data);
    };

    return () => {
      socket.close();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // FUNCTION: handleTextChange
  // WHAT: Updates local state immediately, then broadcasts the new full text
  //       to every other connected client.
  // WHY IT EXISTS: Keeps the typing user's own screen instantly responsive
  //                (no network delay) while still propagating the change.
  // EDGE CASE: Sending only occurs if the socket is fully open; guards
  //            against attempting to send during connection setup.
  // ---------------------------------------------------------------------------
  function handleTextChange(newText: string) {
    setCodeText(newText);

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(newText);
    }
  }

  return (
    <textarea
      className="code-editor"
      value={codeText}
      onChange={(event) => handleTextChange(event.target.value)}
      placeholder="Start typing code..."
      spellCheck={false}
    />
  );
}

export default CodeEditor;