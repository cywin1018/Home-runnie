'use client';

import React, { useState, useEffect } from 'react';
import ChatList from './components/ChatList';
import { getMyChatRooms, getChatRoomMembers } from '@/apis/chat/chat';
import { ChatRoomResponse, ChatRoomMemberRole } from '@homerunnie/shared';
import { ChatRoomsContext } from '@/stores/ChatRoomsContext';

interface ChatListItem {
  id: string;
  title: string;
  participants: string[];
  lastMessage: string;
  unreadCount: number;
  role?: ChatRoomMemberRole;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [dummyRooms, setDummyRooms] = useState<ChatListItem[]>([]);

  // API로 가져온 채팅방 정보를 저장 (ChatBox에서 사용)
  const [chatRoomsMap, setChatRoomsMap] = useState<Map<string, ChatRoomResponse>>(new Map());

  // 초기 로드 시 채팅방 목록 조회
  useEffect(() => {
    const loadChatRooms = async () => {
      setLoading(true);
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
            lastMessage: '새로운 메시지가 없습니다.',
            unreadCount: 0,
            role: room.role,
          };
        });

        setDummyRooms(updatedRooms);
      } catch (error) {
        console.error('채팅방 목록 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatRooms();
  }, []);

  return (
    <div className="flex flex-row justify-center h-[calc(100vh-84px)] -mx-[120px] w-[calc(100%+240px)] max-w-none">
      <aside className="flex flex-col min-w-[400px] border-r border-gray-200 bg-white h-full">
        <div className="shrink-0">
          <h1 className="text-t00 pb-[30px] p-6">채팅</h1>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatRoomsContext.Provider value={chatRoomsMap}>
            <ChatList chatRooms={dummyRooms} activeChatId="" />
          </ChatRoomsContext.Provider>
        </div>
      </aside>
      <main className="flex flex-col w-full bg-gray-100 h-full">
        <ChatRoomsContext.Provider value={chatRoomsMap}>{children}</ChatRoomsContext.Provider>
      </main>
    </div>
  );
}
