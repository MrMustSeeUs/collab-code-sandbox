// =============================================================================
// FILE: client/src/CodeEditor.tsx
// PURPOSE: Renders the primary text-editing surface for the collaborative
//          code sandbox. Currently a self-contained, locally-managed text
//          area; will later be extended to broadcast and receive changes
//          over the WebSocket connection.
// AUTHOR: Abraham Macias
// DATE: 2026-08-11
// DEPENDENCIES: React (useState)
// EDGE CASES: None yet — local-only state, no external sync.
// =============================================================================

import { useState } from 'react';

// -----------------------------------------------------------------------------
// COMPONENT: CodeEditor
// WHAT: A controlled text area representing the shared code buffer.
// WHY IT EXISTS: Isolates all editing-surface concerns (current text, change
//                handling) away from page-level layout in App.tsx.
// EDGE CASE: Currently holds state only in memory — refreshing the page will
//            reset the content. This is expected at this stage; persistence
//            and multi-user sync are handled in later components.
// -----------------------------------------------------------------------------
function CodeEditor() {
  const [codeText, setCodeText] = useState('');

  return (
    <textarea
      className="code-editor"
      value={codeText}
      onChange={(event) => setCodeText(event.target.value)}
      placeholder="Start typing code..."
      spellCheck={false}
    />
  );
}

export default CodeEditor;