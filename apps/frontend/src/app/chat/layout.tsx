'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import ChatList from './components/ChatList';
import { getMyChatRooms, getChatRoomMembers } from '@/apis/chat/chat';
import { ChatRoomResponse, ChatRoomMemberRole } from '@homerunnie/shared';
import { ChatRoomsContext } from '@/stores/ChatRoomsContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';

export interface ChatListItem {
  id: string;
  title: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Date | null;
  unreadCount: number;
  role?: ChatRoomMemberRole;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeChatId = pathname?.match(/\/chat\/(\d+)/)?.[1] ?? '';

  const [chatRooms, setChatRooms] = useState<ChatListItem[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const roomIdsRef = useRef<string[]>([]);
  const activeChatIdRef = useRef(activeChatId);

  // activeChatId가 변경되면 ref 동기화 및 해당 방 unreadCount 초기화
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
    if (activeChatId) {
      setChatRooms((prev) =>
        prev.map((room) => (room.id === activeChatId ? { ...room, unreadCount: 0 } : room)),
      );
    }
  }, [activeChatId]);

  // API로 가져온 채팅방 정보를 저장 (ChatBox에서 사용)
  const [chatRoomsMap, setChatRoomsMap] = useState<Map<string, ChatRoomResponse>>(new Map());

  // 채팅 목록에서 특정 방의 마지막 메시지를 업데이트하고 최상단으로 이동
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

      // 해당 방을 최상단으로 이동
      const [room] = updated.splice(roomIndex, 1);
      return [room, ...updated];
    });
  }, []);

  // 초기 로드 시 채팅방 목록 조회
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        const response = await getMyChatRooms(1, 20);

        // 채팅방 정보를 Map에 저장 (ChatBox에서 사용)
        const roomsMap = new Map<string, ChatRoomResponse>();
        response.data.forEach((room) => {
          roomsMap.set(String(room.id), room);
        });
        setChatRoomsMap(roomsMap);

        // 각 채팅방의 멤버 목록을 병렬로 조회
        const memberResults = await Promise.allSettled(
          response.data.map((room) => getChatRoomMembers(room.id)),
        );

        // API 응답 데이터를 ChatListItem 형식으로 변환
        const updatedRooms: ChatListItem[] = response.data.map((room, index) => {
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
        roomIdsRef.current = updatedRooms.map((r) => r.id);
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error);
      }
    };

    loadChatRooms();
  }, []);

  // Socket.IO로 모든 채팅방의 새 메시지를 실시간 수신
  useEffect(() => {
    const socket = io(`${BACKEND_URL}/chat`, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('authenticated', () => {
      // 모든 채팅방에 join하여 메시지를 수신
      roomIdsRef.current.forEach((roomId) => {
        socket.emit('join_room', { roomId });
      });
    });

    socket.on(
      'received_message',
      (data: { nickname: string; message: string; isOwn: boolean; roomId?: string }) => {
        if (data.roomId) {
          updateRoomLastMessage(data.roomId, data.message);
          // 현재 보고 있지 않은 방이고, 내 메시지가 아니면 unreadCount 증가
          if (data.roomId !== activeChatIdRef.current && !data.isOwn) {
            setChatRooms((prev) =>
              prev.map((room) =>
                room.id === data.roomId ? { ...room, unreadCount: room.unreadCount + 1 } : room,
              ),
            );
          }
        }
      },
    );

    // room_deleted 이벤트 시 목록에서 제거
    socket.on('room_deleted', (data: { roomId: string }) => {
      setChatRooms((prev) => prev.filter((r) => r.id !== data.roomId));
    });

    return () => {
      socket.disconnect();
    };
  }, [updateRoomLastMessage]);

  return (
    <div className="flex flex-row justify-center h-[calc(100vh-84px)] -mx-[120px] w-[calc(100%+240px)] max-w-none">
      <aside className="flex flex-col min-w-[400px] border-r border-gray-200 bg-white h-full">
        <div className="shrink-0">
          <h1 className="text-t00 pb-[30px] p-6">채팅</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatRoomsContext.Provider value={chatRoomsMap}>
            <ChatList chatRooms={chatRooms} activeChatId={activeChatId} />
          </ChatRoomsContext.Provider>
        </div>
      </aside>
      <main className="flex flex-col w-full bg-gray-100 h-full">
        <ChatRoomsContext.Provider value={chatRoomsMap}>{children}</ChatRoomsContext.Provider>
      </main>
    </div>
  );
}
