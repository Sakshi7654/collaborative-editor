import React, { useEffect, useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { socket } from '../services/socket';

export default function CodeEditor({ roomId, username }) {
  const [code, setCode] = useState('// Welcome to CodeMate\nconsole.log("Connected.");');
  const [language, setLanguage] = useState('javascript');
  const [connectedUsers, setConnectedUsers] = useState([]);

  // Tracks whether state update is incoming from remote to suppress echo loop
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    socket.connect();

    // 1. Join session
    socket.emit('room:join', { roomId, username });

    // 2. Incoming code changes
    socket.on('editor:code-update', ({ code: incomingCode }) => {
      isRemoteUpdate.current = true;
      setCode(incomingCode);
    });

    // 3. Incoming language changes
    socket.on('editor:language-update', ({ language: incomingLang }) => {
      setLanguage(incomingLang);
    });

    // 4. User lifecycle
    socket.on('room:user-joined', (user) => {
      setConnectedUsers((prev) => [...prev, user]);
    });

    socket.on('room:user-left', ({ userId }) => {
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    return () => {
      socket.off('editor:code-update');
      socket.off('editor:language-update');
      socket.off('room:user-joined');
      socket.off('room:user-left');
      socket.disconnect();
    };
  }, [roomId, username]);

  const handleCodeChange = (val) => {
    // If the change came from socket.on, ignore firing another emit
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    setCode(val);
    socket.emit('editor:code-change', { roomId, code: val });
  };

  const handleLanguageChange = (e) => {
    const nextLang = e.target.value;
    setLanguage(nextLang);
    socket.emit('editor:language-change', { roomId, language: nextLang });
  };

  const getLanguageExtension = () => {
    if (language === 'python') return [python()];
    if (language === 'cpp') return [cpp()];
    return [javascript()];
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2>Room: <span style={{ color: '#0066cc' }}>{roomId}</span></h2>
          <small style={{ color: '#666' }}>Connected as: {username}</small>
        </div>

        <select 
          value={language} 
          onChange={handleLanguageChange}
          style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
      </header>

      <div style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
        <CodeMirror
          value={code}
          height="480px"
          theme={oneDark}
          extensions={getLanguageExtension()}
          onChange={handleCodeChange}
        />
      </div>
    </div>
  );
}