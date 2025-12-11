import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Copy, Share2, ArrowLeft } from 'lucide-react';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';

export default function SessionRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [code, setCode] = useState('// Loading...');
    const [language, setLanguage] = useState('javascript');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const s = io('http://localhost:3000');
        setSocket(s);

        s.emit('join-session', sessionId);

        s.on('code-update', (newCode) => {
            setCode(newCode);
        });

        s.on('language-update', (newLang) => {
            setLanguage(newLang);
        });

        fetch(`http://localhost:3000/sessions/${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.sessionId) {
                    if (data.code) setCode(data.code);
                    else setCode('// Start coding...');

                    if (data.language) setLanguage(data.language);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        return () => s.disconnect();
    }, [sessionId]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (socket) {
            socket.emit('language-change', { sessionId, language: newLang });
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (loading) return <div className="h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-slate-200">
            <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="hover:text-white transition-colors"><ArrowLeft size={20} /></button>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Interview Session</span>
                        <h1 className="font-bold text-lg text-blue-400">{sessionId}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="sql">SQL</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>

                    <button onClick={copyLink} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all text-sm font-medium shadow-lg hover:shadow-blue-500/20">
                        <Share2 size={16} />
                        Share Link
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 bg-slate-950 relative">
                    <CodeEditor
                        code={code}
                        setCode={setCode}
                        language={language}
                        sessionId={sessionId}
                        socket={socket}
                    />
                </div>
                <div className="w-1/3 min-w-[350px] max-w-[500px] flex flex-col">
                    <OutputPanel code={code} language={language} />
                </div>
            </div>
        </div>
    );
}
