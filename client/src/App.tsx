// =============================================================================
// FILE: client/src/App.tsx
// PURPOSE: Root component of the collaborative code editor application.
//          Composes the page layout, displays the current user's assigned
//          identity, and renders the primary editing surface.
// AUTHOR: Abraham Macias
// DATE: 2026-08-14
// DEPENDENCIES: React, CodeEditor, identity utilities
// EDGE CASES: None — identity resolution is handled entirely within
//             getOrCreateUsername, including its own fallback behavior.
// =============================================================================

import { useState } from 'react';
import CodeEditor from './CodeEditor';
import { getOrCreateUsername } from './utils/identity';
import './App.css';

// -----------------------------------------------------------------------------
// COMPONENT: App
// WHAT: The root component rendered into the page.
// WHY IT EXISTS: Acts as the single entry point React mounts into the DOM;
//                resolves the current user's identity once, then composes
//                the heading, identity display, and editing surface together.
// EDGE CASE: useState's initializer function form is used so
//            getOrCreateUsername only runs once, on first render, rather
//            than on every re-render.
// -----------------------------------------------------------------------------
function App() {
  const [username] = useState(() => getOrCreateUsername());

  return (
    <main className="app-shell">
      <h1>Collaborative Code Sandbox</h1>
      <p className="username-badge">You are: <strong>{username}</strong></p>
      <CodeEditor username={username} />
    </main>
  );
}

export default App;