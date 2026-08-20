// =============================================================================
// FILE: client/src/CodeEditor.tsx
// PURPOSE: Renders the primary text-editing surface for the collaborative
//          code sandbox, a language selector, and a control to trigger
//          execution of the current code in the selected language.
// AUTHOR: Abraham Macias
// DATE: 2026-08-19
// DEPENDENCIES: React (useState)
// EDGE CASES: None — all connection, sync, and execution concerns live in
//             the parent component; this component only reports the
//             user's selected language alongside each run request.
// =============================================================================

import { useState } from 'react';

// -----------------------------------------------------------------------------
// TYPE: CodeEditorProps
// WHAT: The properties this component accepts from its parent.
// -----------------------------------------------------------------------------
type CodeEditorProps = {
  codeText: string;
  onTextChange: (newText: string) => void;
  onTypingActivity: () => void;
  onRunRequested: (language: 'javascript' | 'python') => void;
};

// -----------------------------------------------------------------------------
// COMPONENT: CodeEditor
// WHAT: A controlled text area representing the shared code buffer, with
//       a language selector and a button to request execution.
// WHY IT EXISTS: Isolates the editing surface's presentation from the
//                connection and execution logic that supply its data.
// -----------------------------------------------------------------------------
function CodeEditor({ codeText, onTextChange, onTypingActivity, onRunRequested }: CodeEditorProps) {
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');

  function handleChange(newText: string) {
    onTextChange(newText);
    onTypingActivity();
  }

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <select
          className="language-select"
          value={language}
          onChange={(event) => setLanguage(event.target.value as 'javascript' | 'python')}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button type="button" className="run-button" onClick={() => onRunRequested(language)}>
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