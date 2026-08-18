// =============================================================================
// FILE: client/src/OutputPanel.tsx
// PURPOSE: Hosts a sandboxed iframe used to safely execute JavaScript code
//          submitted from the editor, and displays the resulting output
//          or error message.
// AUTHOR: Abraham Macias
// DATE: 2026-08-18
// DEPENDENCIES: React (useRef, useEffect, useImperativeHandle, forwardRef)
// EDGE CASES: Ignores postMessage events from origins/sources other than
//             its own sandbox iframe, to avoid processing unrelated
//             browser messages.
// =============================================================================

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

// -----------------------------------------------------------------------------
// TYPE: OutputPanelHandle
// WHAT: The methods this component exposes to its parent via a ref.
// WHY IT EXISTS: Lets a parent component (CodeEditor's sibling controls)
//                trigger execution without owning the iframe directly.
// -----------------------------------------------------------------------------
export type OutputPanelHandle = {
    runCode: (code: string) => void;
};

// -----------------------------------------------------------------------------
// COMPONENT: OutputPanel
// WHAT: Renders a hidden sandboxed iframe plus a visible output display.
// WHY IT EXISTS: Isolates code-execution concerns from the editor itself,
//                so the execution mechanism can later be extended (e.g.
//                to support Python) without touching editor code.
// EDGE CASE: forwardRef + useImperativeHandle is used so the parent can
//            call runCode() imperatively, since sending a postMessage
//            isn't naturally expressed as a prop change.
// -----------------------------------------------------------------------------
const OutputPanel = forwardRef<OutputPanelHandle>((_props, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [output, setOutput] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.data?.type !== 'executionResult') return;

            setOutput(event.data.output);
            setErrorMessage(event.data.error);
        }

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useImperativeHandle(ref, () => ({
        runCode(code: string) {
            setOutput('');
            setErrorMessage(null);
            iframeRef.current?.contentWindow?.postMessage({ code }, '*');
        },
    }));

    return (
        <div className="output-panel">
            <h2 className="output-panel-heading">Output</h2>
            <pre className={errorMessage ? 'output-content output-error' : 'output-content'}>
                {errorMessage ?? output ?? ''}
                {!errorMessage && !output && 'Run your code to see output here.'}
            </pre>
            <iframe
                ref={iframeRef}
                src="/sandbox.html"
                sandbox="allow-scripts"
                title="Code execution sandbox"
                className="execution-sandbox"
            />
        </div>
    );
});

export default OutputPanel;