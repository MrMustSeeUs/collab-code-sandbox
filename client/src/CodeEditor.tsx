// =============================================================================
// FILE: client/src/CodeEditor.tsx
// PURPOSE: Renders the primary text-editing surface for the collaborative
//          code sandbox. Purely presentational with respect to real-time
//          state — receives the current text and update/typing callbacks
//          from its parent, which owns the shared room connection.
// AUTHOR: Abraham Macias
// DATE: 2026-08-17
// DEPENDENCIES: React
// EDGE CASES: None — all connection and sync concerns live in the parent's
//             useRoomConnection hook.
// =============================================================================

// -----------------------------------------------------------------------------
// TYPE: CodeEditorProps
// WHAT: The properties this component accepts from its parent.
// WHY IT EXISTS: Documents the contract with App.tsx and gives TypeScript
//                enough information to catch mismatches at compile time.
// -----------------------------------------------------------------------------
type CodeEditorProps = {
  codeText: string;
  onTextChange: (newText: string) => void;
  onTypingActivity: () => void;
};

// -----------------------------------------------------------------------------
// COMPONENT: CodeEditor
// WHAT: A controlled text area representing the shared code buffer.
// WHY IT EXISTS: Isolates the editing surface's presentation from the
//                connection logic that supplies its data.
// -----------------------------------------------------------------------------
function CodeEditor({ codeText, onTextChange, onTypingActivity }: CodeEditorProps) {
  function handleChange(newText: string) {
    onTextChange(newText);
    onTypingActivity();
  }

  return (
    <textarea
      className="code-editor"
      value={codeText}
      onChange={(event) => handleChange(event.target.value)}
      placeholder="Start typing code..."
      spellCheck={false}
    />
  );
}

export default CodeEditor;