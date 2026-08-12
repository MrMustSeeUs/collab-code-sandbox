// =============================================================================
// FILE: client/src/App.tsx
// PURPOSE: Root component of the collaborative code editor application.
//          Composes the page layout and renders the primary editing surface.
// AUTHOR: Abraham Macias
// DATE: 2026-08-12
// DEPENDENCIES: React, CodeEditor
// EDGE CASES: None yet — this is an intentionally minimal starting shell.
// =============================================================================

import CodeEditor from './CodeEditor';
import './App.css';

// -----------------------------------------------------------------------------
// COMPONENT: App
// WHAT: The root component rendered into the page.
// WHY IT EXISTS: Acts as the single entry point React mounts into the DOM;
//                composes the heading and editing surface together.
// -----------------------------------------------------------------------------
function App() {
  return (
    <main className="app-shell">
      <h1>Collaborative Code Sandbox</h1>
      <CodeEditor />
    </main>
  );
}

export default App;