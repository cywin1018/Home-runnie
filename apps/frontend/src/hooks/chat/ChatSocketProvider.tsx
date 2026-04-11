'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';

interface ChatSocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const ChatSocketContext = createContext<ChatSocketContextValue>({
  socket: null,
  connected: false,
});

export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(`${BACKEND_URL}/chat`, { withCredentials: true });

    newSocket.on('authenticated', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <ChatSocketContext.Provider value={{ socket, connected }}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export const useChatSocket = () => useContext(ChatSocketContext);
