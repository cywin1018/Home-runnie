'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'me' | 'other';
  nickname: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';

export function useSocket(roomId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [joinRequestCount, setJoinRequestCount] = useState(0);
  const [kickedFromRoom, setKickedFromRoom] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);

  useEffect(() => {
    const socket = io(`${BACKEND_URL}/chat`, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('authenticated', () => {
      setConnected(true);
      socket.emit('join_room', { roomId });
    });

    socket.on(
      'message_history',
      (
        history: {
          id: number;
          message: string;
          isOwn: boolean;
          nickname: string;
          createdAt: string;
        }[],
      ) => {
        setMessages(
          history.map((msg) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.isOwn ? 'me' : ('other' as const),
            nickname: msg.isOwn ? '' : msg.nickname,
          })),
        );
      },
    );

    socket.on('received_message', (data: { nickname: string; message: string; isOwn: boolean }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data.message,
          sender: data.isOwn ? 'me' : 'other',
          nickname: data.nickname,
        },
      ]);
    });

    socket.on('user_joined', (data: { nickname: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: data.message, sender: 'other', nickname: '' },
      ]);
    });

    socket.on('user_left', (data: { nickname: string; message: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: data.message, sender: 'other', nickname: '' },
      ]);
    });

    socket.on('join_request_received', () => {
      setJoinRequestCount((prev) => prev + 1);
    });

    socket.on('member_joined', (data: { memberId: number }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: '새로운 멤버가 참여했습니다.', sender: 'other', nickname: '' },
      ]);
    });

    socket.on('member_kicked', (data: { memberId: number }) => {
      setKickedFromRoom(true);
    });

    socket.on('room_deleted', () => {
      setRoomDeleted(true);
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (text: string) => {
      socketRef.current?.emit('message', { roomId, message: text });
    },
    [roomId],
  );

  const resetJoinRequestCount = useCallback(() => {
    setJoinRequestCount(0);
  }, []);

  return {
    messages,
    sendMessage,
    connected,
    joinRequestCount,
    resetJoinRequestCount,
    kickedFromRoom,
    roomDeleted,
  };
}
