import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connecté ✅');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  const joinRoom = useCallback((receiverId) => {
    socketRef.current?.emit('joinRoom', { userId, receiverId });
  }, [userId]);

  const sendMessage = useCallback((receiverId, content) => {
    socketRef.current?.emit('sendMessage', {
      senderId: userId,
      receiverId,
      content,
    });
  }, [userId]);

  const onReceiveMessage = useCallback((callback) => {
    socketRef.current?.on('receiveMessage', callback);
    return () => socketRef.current?.off('receiveMessage', callback);
  }, []);

  const emitTyping = useCallback((receiverId) => {
    socketRef.current?.emit('typing', { userId, receiverId });
  }, [userId]);

  const emitStopTyping = useCallback((receiverId) => {
    socketRef.current?.emit('stopTyping', { userId, receiverId });
  }, [userId]);

  const onUserTyping = useCallback((callback) => {
    socketRef.current?.on('userTyping', callback);
    return () => socketRef.current?.off('userTyping', callback);
  }, []);

  const onUserStopTyping = useCallback((callback) => {
    socketRef.current?.on('userStopTyping', callback);
    return () => socketRef.current?.off('userStopTyping', callback);
  }, []);

  return {
    joinRoom,
    sendMessage,
    onReceiveMessage,
    emitTyping,
    emitStopTyping,
    onUserTyping,
    onUserStopTyping,
  };
};