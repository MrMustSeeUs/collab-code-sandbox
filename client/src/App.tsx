// =============================================================================
// FILE: client/src/App.tsx
// PURPOSE: Root component of the collaborative code editor application.
//          Resolves the current user's identity and room, owns the shared
//          real-time connection via useRoomConnection, and composes the
//          page layout from that shared data.
// AUTHOR: Abraham Macias
// DATE: 2026-08-17
// DEPENDENCIES: React, CodeEditor, RoomPresence, identity utilities,
//                useRoomConnection
// EDGE CASES: None — identity and connection setup are each handled once,
//             on initial render, via useState's initializer form.
// =============================================================================

import { useState } from 'react';
import CodeEditor from './CodeEditor';
import RoomPresence from './RoomPresence';
import { getOrCreateUsername, getOrCreateRoomId } from './utils/identity';
import { useRoomConnection } from './utils/useRoomConnection';
import './App.css';

// -----------------------------------------------------------------------------
// COMPONENT: App
// WHAT: The root component rendered into the page.
// WHY IT EXISTS: Resolves identity once, owns the single shared room
//                connection, and composes the heading, presence list, and
//                editing surface from that one shared source of truth.
// -----------------------------------------------------------------------------
function App() {
  const [username] = useState(() => getOrCreateUsername());
  const [roomId] = useState(() => getOrCreateRoomId());
  const { codeText, participants, sendCodeUpdate, reportTypingActivity } =
    useRoomConnection(roomId, username);

  return (
    <main className="app-shell">
      <h1>Collaborative Code Sandbox</h1>
      <p className="username-badge">You are: <strong>{username}</strong></p>

      <div className="workspace">
        <CodeEditor
          codeText={codeText}
          onTextChange={sendCodeUpdate}
          onTypingActivity={reportTypingActivity}
        />
        <RoomPresence participants={participants} />
      </div>
    </main>
  );
}

export default App;