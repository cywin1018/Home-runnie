'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ChatRoomResponse, ChatRoomMemberRole } from '@homerunnie/shared';
import { getChatRoomMembers } from '@/apis/chat/chat';
import { useChatSocket } from './ChatSocketProvider';
import { useChatRoomsQuery } from './useChatQuery';

export interface ChatListItem {
  id: string;
  title: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadCount: number;
  role?: ChatRoomMemberRole;
}

export function useChatRooms() {
  const pathname = usePathname();
  const activeChatId = pathname?.match(/\/chat\/(\d+)/)?.[1] ?? '';
  const { socket } = useChatSocket();
  const { data: roomsResponse } = useChatRoomsQuery();

  const [chatRooms, setChatRooms] = useState<ChatListItem[]>([]);

  // 동기 데이터는 useMemo로 파생 (state + useEffect 불필요)
  const chatRoomsMap = useMemo(() => {
    if (!roomsResponse) return new Map<string, ChatRoomResponse>();
    const map = new Map<string, ChatRoomResponse>();
    roomsResponse.data.forEach((room) => map.set(String(room.id), room));
    return map;
  }, [roomsResponse]);

  const roomIds = useMemo(() => {
    if (!roomsResponse) return [] as string[];
    return roomsResponse.data.map((room) => String(room.id));
  }, [roomsResponse]);

  // 비동기 멤버 조회 → ChatListItem 변환
  useEffect(() => {
    if (!roomsResponse) return;

    const loadMembers = async () => {
      const memberResults = await Promise.allSettled(
        roomsResponse.data.map((room) => getChatRoomMembers(room.id)),
      );

      const updatedRooms: ChatListItem[] = roomsResponse.data.map((room, index) => {
        const memberResult = memberResults[index];
        const members =
          memberResult.status === 'fulfilled' ? memberResult.value.map((m) => m.nickname) : [];

        return {
          id: String(room.id),
          title: room.postTitle,
          participants: members,
          lastMessage: room.lastMessage ?? '새로운 메시지가 없습니다.',
          lastMessageAt: room.lastMessageAt ?? null,
          unreadCount: room.unreadCount ?? 0,
          role: room.role,
        };
      });

      setChatRooms(updatedRooms);
    };

    loadMembers();
  }, [roomsResponse]);

  // activeChatId 변경 시 해당 방 unreadCount 초기화
  useEffect(() => {
    if (activeChatId) {
      setChatRooms((prev) =>
        prev.map((room) => (room.id === activeChatId ? { ...room, unreadCount: 0 } : room)),
      );
    }
  }, [activeChatId]);

  const updateRoomLastMessage = useCallback((roomId: string, message: string) => {
    setChatRooms((prev) => {
      const roomIndex = prev.findIndex((r) => r.id === roomId);
      if (roomIndex === -1) return prev;

      const updated = [...prev];
      updated[roomIndex] = {
        ...updated[roomIndex],
        lastMessage: message,
        lastMessageAt: new Date(),
      };

      const [room] = updated.splice(roomIndex, 1);
      return [room, ...updated];
    });
  }, []);

  // 소켓: 방 join + 이벤트 수신 (하나로 통합)
  useEffect(() => {
    if (!socket || roomIds.length === 0) return;

    const joinAllRooms = () => {
      roomIds.forEach((id) => socket.emit('join_room', { roomId: id }));
    };

    if (socket.connected) {
      joinAllRooms();
    }

    const handleMessage = (data: {
      nickname: string;
      message: string;
      isOwn: boolean;
      roomId?: string;
    }) => {
      if (data.roomId) {
        updateRoomLastMessage(data.roomId, data.message);

        if (data.roomId !== activeChatId && !data.isOwn) {
          setChatRooms((prev) =>
            prev.map((room) =>
              room.id === data.roomId ? { ...room, unreadCount: room.unreadCount + 1 } : room,
            ),
          );
        }
      }
    };

    const handleRoomDeleted = (data: { roomId: string }) => {
      setChatRooms((prev) => prev.filter((r) => r.id !== data.roomId));
    };

    socket.on('authenticated', joinAllRooms);
    socket.on('received_message', handleMessage);
    socket.on('room_deleted', handleRoomDeleted);

    return () => {
      socket.off('authenticated', joinAllRooms);
      socket.off('received_message', handleMessage);
      socket.off('room_deleted', handleRoomDeleted);
    };
  }, [socket, roomIds, activeChatId, updateRoomLastMessage]);

  return { chatRooms, chatRoomsMap, activeChatId };
}
