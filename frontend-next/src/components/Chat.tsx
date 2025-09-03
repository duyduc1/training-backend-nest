"use client";

import { useState, useEffect, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function Chat() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket = io("http://localhost:3000");

    socket.on('connect', () => {
      console.log('Connected to WebSocket server!');
    });

    socket.on('receiveMessage', (newMessage: string) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      console.log('Disconnecting from WebSocket server...');
      socket.disconnect();
    };
  }, []); 

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('sendMessage', message);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Next.js Mini Chat (TypeScript)</h1>
      <ul style={{ height: '300px', border: '1px solid #ccc', overflowY: 'scroll', listStyleType: 'none', padding: '10px' }}>
        {messages.map((msg, index) => (
          <li key={index} style={{ padding: '5px', background: index % 2 === 0 ? '#f0f0f0' : '#fff' }}>
            {msg}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ width: '80%', padding: '10px' }}
        />
        <button type="submit" style={{ width: '19%', padding: '10px' }}>Send</button>
      </form>
    </div>
  );
}