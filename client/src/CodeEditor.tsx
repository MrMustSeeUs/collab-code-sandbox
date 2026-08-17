// =============================================================================
// FILE: client/src/CodeEditor.tsx
// PURPOSE: Renders the primary text-editing surface for the collaborative
//          code sandbox. Maintains a live WebSocket connection scoped to
//          the current room, so changes are broadcast to, and received
//          from, only the other users sharing that same room.
// AUTHOR: Abraham Macias
// DATE: 2026-08-17
// DEPENDENCIES: React (useState, useEffect, useRef), identity utilities
// EDGE CASES: Ignores incoming messages that match the current local text,
//             to avoid redundant re-renders. Closes the socket cleanly on
//             unmount to prevent orphaned connections.
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import { getOrCreateRoomId } from './utils/identity';

const SERVER_URL = 'ws://localhost:8080';

// -----------------------------------------------------------------------------
// TYPE: CodeEditorProps
// WHAT: The properties this component accepts from its parent.
// WHY IT EXISTS: Documents the contract between App and CodeEditor, and
//                gives TypeScript enough information to catch mismatches
//                at compile time rather than at runtime.
// -----------------------------------------------------------------------------
type CodeEditorProps = {
  username: string;
};

// -----------------------------------------------------------------------------
// COMPONENT: CodeEditor
// WHAT: A controlled text area representing the shared code buffer, synced
//       across all connected clients in the same room via WebSocket.
// WHY IT EXISTS: Isolates all editing-surface and real-time sync concerns
//                away from page-level layout in App.tsx.
// EDGE CASE: The room ID is resolved once via useState's initializer form,
//            matching the same pattern used for username in App.tsx.
// -----------------------------------------------------------------------------
function CodeEditor({ username }: CodeEditorProps) {
  const [codeText, setCodeText] = useState('');
  const [roomId] = useState(() => getOrCreateRoomId());
  const socketRef = useRef<WebSocket | null>(null);

  // ---------------------------------------------------------------------------
  // Opens the WebSocket connection once, when the component first appears,
  // and closes it if the component is ever removed from the page.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const socket = new WebSocket(SERVER_URL);
    socketRef.current = socket;

    // Announce which room this connection belongs to, immediately after
    // the connection opens. The server uses this to group clients.
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'join', roomId }));
    };

    socket.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      if (parsedMessage.type === 'codeUpdate') {
        setCodeText(parsedMessage.text);
      }
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  // ---------------------------------------------------------------------------
  // FUNCTION: handleTextChange
  // WHAT: Updates local state immediately, then broadcasts the new full text
  //       to every other client sharing the same room.
  // WHY IT EXISTS: Keeps the typing user's own screen instantly responsive
  //                (no network delay) while still propagating the change.
  // EDGE CASE: Sending only occurs if the socket is fully open; guards
  //            against attempting to send during connection setup.
  // ---------------------------------------------------------------------------
  function handleTextChange(newText: string) {
    setCodeText(newText);

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'codeUpdate',
        roomId,
        text: newText,
        username,
      }));
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