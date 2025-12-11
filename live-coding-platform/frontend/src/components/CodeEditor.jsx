import React, { useEffect, useState } from 'react';
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, setCode, language, sessionId, socket }) {

    // Socket listeners moved to parent to avoid dupes/race conditions on re-renders handled there
    // We just take props here.

    const handleEditorChange = (value) => {
        setCode(value);
        if (socket) {
            socket.emit('code-change', { sessionId, code: value });
        }
    };

    return (
        <div className="h-full w-full shadow-2xl rounded-lg overflow-hidden border border-slate-800">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                    fontLigatures: true,
                    automaticLayout: true,
                    padding: { top: 16 }
                }}
            />
        </div>
    );
}
