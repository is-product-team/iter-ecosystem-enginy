'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

/**
 * Hook to access the global socket instance in the web app
 */
export const useSocket = () => useContext(SocketContext);

/**
 * SocketProvider for Web - Synchronized with Auth state
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        console.log('📡 [WEB SOCKET] Disconnecting due to logout');
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Avoid multiple connections
    if (socketRef.current?.connected) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    console.log('📡 [WEB SOCKET] Initializing connection to:', socketUrl);
    
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('📡 [WEB SOCKET] Connected successfully');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('📡 [WEB SOCKET] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('📡 [WEB SOCKET] Connection Error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
