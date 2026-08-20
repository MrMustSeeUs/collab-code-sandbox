// =============================================================================
// FILE: client/src/OutputPanel.tsx
// PURPOSE: Hosts a sandboxed iframe used to safely execute code submitted
//          from the editor (JavaScript or Python), and displays the
//          resulting output, status, or error message.
// AUTHOR: Abraham Macias
// DATE: 2026-08-19
// DEPENDENCIES: React (useRef, useEffect, useState, useImperativeHandle,
//                forwardRef)
// EDGE CASES: Ignores postMessage events that don't match this component's
//             expected message shapes, to avoid processing unrelated
//             browser messages. Status messages (e.g. "Loading Python
//             runtime…") are shown only while no result has arrived yet.
// =============================================================================

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

// -----------------------------------------------------------------------------
// TYPE: OutputPanelHandle
// WHAT: The methods this component exposes to its parent via a ref.
// -----------------------------------------------------------------------------
export type OutputPanelHandle = {
    runCode: (code: string, language: 'javascript' | 'python') => void;
};

// -----------------------------------------------------------------------------
// COMPONENT: OutputPanel
// WHAT: Renders a hidden sandboxed iframe plus a visible output display.
// WHY IT EXISTS: Isolates code-execution concerns from the editor itself.
// -----------------------------------------------------------------------------
const OutputPanel = forwardRef<OutputPanelHandle>((_props, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [output, setOutput] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.data?.type === 'status') {
                setStatusMessage(event.data.message);
                return;
            }

            if (event.data?.type === 'executionResult') {
                setStatusMessage(null);
                setOutput(event.data.output);
                setErrorMessage(event.data.error);
            }
        }

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useImperativeHandle(ref, () => ({
        runCode(code: string, language: 'javascript' | 'python') {
            setOutput('');
            setErrorMessage(null);
            setStatusMessage(null);
            iframeRef.current?.contentWindow?.postMessage({ code, language }, '*');
        },
    }));

    const displayText = statusMessage ?? errorMessage ?? output ?? '';
    const isError = Boolean(errorMessage) && !statusMessage;

    return (
        <div className="output-panel">
            <h2 className="output-panel-heading">Output</h2>
            <pre className={isError ? 'output-content output-error' : 'output-content'}>
                {displayText || 'Run your code to see output here.'}
            </pre>
            <iframe
                ref={iframeRef}
                src="/sandbox.html"
                sandbox="allow-scripts allow-same-origin"
                title="Code execution sandbox"
                className="execution-sandbox"
            />
        </div>
    );
});

export default OutputPanel;