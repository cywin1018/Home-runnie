'use client';

import { useEffect, useState, useCallback } from 'react';
import { useChatSocket } from './ChatSocketProvider';

const SYSTEM_PREFIX = '[SYSTEM]';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'me' | 'other' | 'system';
  nickname: string;
  supportTeam: string | null;
}

export function useSocket(roomId: string) {
  const { socket, connected } = useChatSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [joinRequestCount, setJoinRequestCount] = useState(0);
  const [kickedFromRoom, setKickedFromRoom] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);

  useEffect(() => {
    if (!socket || !connected) return;

    // 방 입장 (message_history 수신을 위해)
    socket.emit('join_room', { roomId });

    const handleHistory = (
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
    };

    const handleMessage = (data: {
      nickname: string;
      message: string;
      isOwn: boolean;
      supportTeam?: string | null;
      roomId?: string;
    }) => {
      // 다른 방의 메시지는 무시 (공유 소켓이므로 모든 방의 메시지가 수신됨)
      if (data.roomId && data.roomId !== roomId) return;

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
    };

    const handleJoinRequest = () => setJoinRequestCount((prev) => prev + 1);
    const handleKicked = () => setKickedFromRoom(true);
    const handleDeleted = () => setRoomDeleted(true);

    socket.on('message_history', handleHistory);
    socket.on('received_message', handleMessage);
    socket.on('join_request_received', handleJoinRequest);
    socket.on('member_kicked', handleKicked);
    socket.on('room_deleted', handleDeleted);

    return () => {
      socket.off('message_history', handleHistory);
      socket.off('received_message', handleMessage);
      socket.off('join_request_received', handleJoinRequest);
      socket.off('member_kicked', handleKicked);
      socket.off('room_deleted', handleDeleted);
    };
  }, [socket, connected, roomId]);

  const sendMessage = useCallback(
    (text: string) => {
      socket?.emit('message', { roomId, message: text });
    },
    [socket, roomId],
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
