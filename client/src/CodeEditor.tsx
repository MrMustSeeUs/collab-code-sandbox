// =============================================================================
// FILE: client/src/CodeEditor.tsx
// PURPOSE: Renders the primary text-editing surface for the collaborative
//          code sandbox, plus a control to trigger execution of the
//          current code. Purely presentational with respect to real-time
//          state and execution — all of that is owned by the parent.
// AUTHOR: Abraham Macias
// DATE: 2026-08-18
// DEPENDENCIES: React
// EDGE CASES: None — all connection, sync, and execution concerns live in
//             the parent component.
// =============================================================================

// -----------------------------------------------------------------------------
// TYPE: CodeEditorProps
// WHAT: The properties this component accepts from its parent.
// -----------------------------------------------------------------------------
type CodeEditorProps = {
  codeText: string;
  onTextChange: (newText: string) => void;
  onTypingActivity: () => void;
  onRunRequested: () => void;
};

// -----------------------------------------------------------------------------
// COMPONENT: CodeEditor
// WHAT: A controlled text area representing the shared code buffer, with
//       a button to request execution of its current contents.
// WHY IT EXISTS: Isolates the editing surface's presentation from the
//                connection and execution logic that supply its data.
// -----------------------------------------------------------------------------
function CodeEditor({ codeText, onTextChange, onTypingActivity, onRunRequested }: CodeEditorProps) {
  function handleChange(newText: string) {
    onTextChange(newText);
    onTypingActivity();
  }

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <button type="button" className="run-button" onClick={onRunRequested}>
          ▶ Run
        </button>
      </div>
      <textarea
        className="code-editor"
        value={codeText}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Start typing code..."
        spellCheck={false}
      />
    </div>
  );
}

export default CodeEditor;