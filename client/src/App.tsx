// =============================================================================
// FILE: client/src/App.tsx
// PURPOSE: Root component of the collaborative code editor application.
//          Resolves the current user's identity and room, owns the shared
//          real-time connection, and coordinates code execution between
//          the editor and the sandboxed output panel.
// AUTHOR: Abraham Macias
// DATE: 2026-08-18
// DEPENDENCIES: React, CodeEditor, RoomPresence, OutputPanel, identity
//                utilities, useRoomConnection
// EDGE CASES: None — identity and connection setup are each handled once,
//             on initial render, via useState's initializer form.
// =============================================================================

import { useState, useRef } from 'react';
import CodeEditor from './CodeEditor';
import RoomPresence from './RoomPresence';
import OutputPanel, { type OutputPanelHandle } from './OutputPanel';
import { getOrCreateUsername, getOrCreateRoomId } from './utils/identity';
import { useRoomConnection } from './utils/useRoomConnection';
import './App.css';

// -----------------------------------------------------------------------------
// COMPONENT: App
// WHAT: The root component rendered into the page.
// WHY IT EXISTS: Resolves identity once, owns the shared room connection,
//                and coordinates the editor and sandboxed execution panel
//                via a ref, since triggering execution is an imperative
//                action rather than a natural prop flow.
// -----------------------------------------------------------------------------
function App() {
  const [username] = useState(() => getOrCreateUsername());
  const [roomId] = useState(() => getOrCreateRoomId());
  const { codeText, participants, sendCodeUpdate, reportTypingActivity } =
    useRoomConnection(roomId, username);

  const outputPanelRef = useRef<OutputPanelHandle>(null);

  function handleRunRequested() {
    outputPanelRef.current?.runCode(codeText);
  }

  return (
    <main className="app-shell">
      <h1>Collaborative Code Sandbox</h1>
      <p className="username-badge">You are: <strong>{username}</strong></p>

      <div className="workspace">
        <div className="main-column">
          <CodeEditor
            codeText={codeText}
            onTextChange={sendCodeUpdate}
            onTypingActivity={reportTypingActivity}
            onRunRequested={handleRunRequested}
          />
          <OutputPanel ref={outputPanelRef} />
        </div>
        <RoomPresence participants={participants} />
      </div>
    </main>
  );
}

export default App;