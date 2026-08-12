// =============================================================================
// FILE: client/src/App.tsx
// PURPOSE: Root component of the collaborative code editor application.
//          Serves as the top-level container that future features (the
//          editor pane, connection status, and room controls) will be
//          composed into.
// AUTHOR: Abraham Macias
// DATE: 2026-08-11
// DEPENDENCIES: React
// EDGE CASES: None yet — this is an intentionally minimal starting shell.
// =============================================================================

// -----------------------------------------------------------------------------
// COMPONENT: App
// WHAT: The root component rendered into the page.
// WHY IT EXISTS: Acts as the single entry point React mounts into the DOM;
//                all future UI composition starts here.
// -----------------------------------------------------------------------------
function App() {
  return (
    <main className="app-shell">
      <h1>Collaborative Code Sandbox</h1>
    </main>
  );
}

export default App;