import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as ExpoConstants from 'expo-constants';

const Constants = ExpoConstants.default || ExpoConstants;

/**
 * Robust URL resolver for Socket.io
 */
const getSocketURL = () => {
  // Try to get from Expo Constants (env vars)
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 
                 Constants.expoConfig?.hostUri?.split(':').shift()?.concat(':3000') ||
                 'http://localhost:3000';
                 
  // Ensure protocol
  if (!apiUrl.startsWith('http')) {
    return `http://${apiUrl}`;
  }
  return apiUrl;
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

/**
 * Hook to access the global socket instance
 */
export const useSocket = () => useContext(SocketContext);

/**
 * Provider to wrap the application and manage the WebSocket lifecycle
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      try {
        let token = null;
        if (Platform.OS === 'web') {
          token = localStorage.getItem('token');
        } else {
          token = await SecureStore.getItemAsync('token');
        }

        if (!token || !isMounted) return;

        // Initialize socket with Bearer token in auth object
        const socketUrl = getSocketURL();
        const url = new URL(socketUrl);
        
        const socket = io(socketUrl, {
          path: url.pathname === '/' ? '/socket.io' : `${url.pathname}/socket.io`,
          auth: { token },
          transports: ['websocket'],
          reconnectionAttempts: 5,
          timeout: 10000,
        });

        socket.on('connect', () => {
          if (isMounted) setIsConnected(true);
          console.log('📡 [SOCKET] Connected successfully');
        });

        socket.on('disconnect', (reason) => {
          if (isMounted) setIsConnected(false);
          console.log('📡 [SOCKET] Disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
          console.error('📡 [SOCKET] Connection Error:', err.message);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('📡 [SOCKET] Init failed:', error);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
