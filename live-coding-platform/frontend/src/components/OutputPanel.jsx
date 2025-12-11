import React, { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function OutputPanel({ code, language }) {
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [pyodide, setPyodide] = useState(null);

    useEffect(() => {
        async function initPyodide() {
            if (window.loadPyodide && !pyodide) {
                try {
                    const py = await window.loadPyodide();
                    setPyodide(py);
                } catch (e) {
                    console.error("Pyodide failed to load", e);
                }
            }
        }
        if (language === 'python') initPyodide();
    }, [language, pyodide]);

    const runCode = async () => {
        setIsRunning(true);
        setOutput([]);

        const logs = [];
        const log = (...args) => logs.push(args.join(' '));

        try {
            if (language === 'javascript') {
                const originalLog = console.log;
                console.log = log;
                try {
                    // eslint-disable-next-line no-eval
                    const result = eval(code);
                    if (result !== undefined) logs.push(String(result));
                } catch (e) {
                    logs.push(`Error: ${e.message}`);
                } finally {
                    console.log = originalLog;
                }
            } else if (language === 'python') {
                if (!pyodide) {
                    logs.push("Python is loading, please wait...");
                    // Try loading again?
                    if (window.loadPyodide) {
                        const py = await window.loadPyodide();
                        setPyodide(py);
                        try {
                            py.setStdout({ batched: (msg) => logs.push(msg) });
                            py.setStderr({ batched: (msg) => logs.push(msg) });
                            await py.runPythonAsync(code);
                        } catch (e) {
                            logs.push(`Error: ${e.message}`);
                        }
                    }
                } else {
                    try {
                        pyodide.setStdout({ batched: (msg) => logs.push(msg) });
                        pyodide.setStderr({ batched: (msg) => logs.push(msg) });
                        await pyodide.runPythonAsync(code);
                    } catch (e) {
                        logs.push(`Error: ${e.message}`);
                    }
                }
            } else {
                logs.push(`Execution not supported for ${language} yet.`);
            }
        } catch (err) {
            logs.push(`Runtime Error: ${err.message}`);
        }

        setOutput(logs);
        setIsRunning(false);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h2 className="font-semibold text-slate-200">Output</h2>
                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded font-medium text-sm transition-colors",
                        isRunning ? "bg-slate-800 text-slate-500" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                >
                    {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                    Run Code
                </button>
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto text-slate-300 whitespace-pre-wrap">
                {output.length === 0 ? (
                    <span className="text-slate-600 italic">Click Run to see output...</span>
                ) : (
                    output.map((line, i) => <div key={i}>{line}</div>)
                )}
            </div>
        </div>
    );
}
