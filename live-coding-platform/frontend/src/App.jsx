import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateSession from './components/CreateSession';
import SessionRoom from './components/SessionRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateSession />} />
        <Route path="/session/:sessionId" element={<SessionRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
