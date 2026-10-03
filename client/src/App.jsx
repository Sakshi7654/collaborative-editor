import React from 'react';
import CodeEditor from './components/CodeEditor';

export default function App() {
  // Fixed room ID & mock user for local testing
  return <CodeEditor roomId="practice-room" username={`User-${Math.floor(Math.random() * 1000)}`} />;
}