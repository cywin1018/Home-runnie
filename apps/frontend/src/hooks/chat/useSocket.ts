'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SYSTEM_PREFIX = '[SYSTEM]';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'me' | 'other' | 'system';
  nickname: string;
  supportTeam: string | null;
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
          supportTeam: string | null;
          createdAt: string;
        }[],
      ) => {
        setMessages(
          history.map((msg) => {
            const isSystem = msg.message.startsWith(SYSTEM_PREFIX);
            return {
              id: msg.id,
              text: isSystem ? msg.message.slice(SYSTEM_PREFIX.length) : msg.message,
              sender: isSystem ? ('system' as const) : msg.isOwn ? 'me' : ('other' as const),
              nickname: isSystem ? '' : msg.isOwn ? '' : msg.nickname,
              supportTeam: isSystem ? null : msg.supportTeam,
            };
          }),
        );
      },
    );

    socket.on(
      'received_message',
      (data: {
        nickname: string;
        message: string;
        isOwn: boolean;
        supportTeam?: string | null;
      }) => {
        const isSystem = data.message.startsWith(SYSTEM_PREFIX);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: isSystem ? data.message.slice(SYSTEM_PREFIX.length) : data.message,
            sender: isSystem ? 'system' : data.isOwn ? 'me' : 'other',
            nickname: isSystem ? '' : data.nickname,
            supportTeam: isSystem ? null : (data.supportTeam ?? null),
          },
        ]);
      },
    );

    socket.on('join_request_received', () => {
      setJoinRequestCount((prev) => prev + 1);
    });

    socket.on('member_joined', () => {
      // 시스템 메시지는 백엔드에서 저장 후 received_message로 전달됨
    });

    socket.on('member_kicked', () => {
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
