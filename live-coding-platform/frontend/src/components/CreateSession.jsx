import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Terminal } from 'lucide-react';

export default function CreateSession() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const createSession = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/sessions', { method: 'POST' });
            const data = await res.json();
            navigate(`/session/${data.sessionId}`);
        } catch (e) {
            console.error(e);
            alert('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center mb-8">
                    <Code2 size={64} className="text-blue-500" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Live Coding Platform
                </h1>
                <p className="text-slate-400 text-lg">
                    Conduct technical interviews with real-time collaboration and execution.
                </p>

                <button
                    onClick={createSession}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                    {loading ? 'Creating...' : (
                        <>
                            <Terminal size={20} />
                            Start New Interview
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
