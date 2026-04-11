'use client';

import React from 'react';
import ChatList from './components/ChatList';
import { ChatRoomsContext } from '@/stores/ChatRoomsContext';
import { ChatSocketProvider } from '@/hooks/chat/ChatSocketProvider';
import { useChatRooms } from '@/hooks/chat/useChatRooms';

// ChatList에서 사용하는 타입을 useChatRooms에서 re-export
export type { ChatListItem } from '@/hooks/chat/useChatRooms';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatSocketProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </ChatSocketProvider>
  );
}

function ChatLayoutContent({ children }: { children: React.ReactNode }) {
  const { chatRooms, chatRoomsMap, activeChatId } = useChatRooms();

  return (
    <ChatRoomsContext.Provider value={chatRoomsMap}>
      <div className="flex flex-row justify-center h-[calc(100vh-84px)] -mx-5 w-[calc(100%+40px)] lg:-mx-[120px] lg:w-[calc(100%+240px)] max-w-none">
        <aside
          className={`${activeChatId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-auto lg:min-w-[400px] border-r border-gray-200 bg-white h-full`}
        >
          <div className="shrink-0">
            <h1 className="text-t03-b lg:text-t00 pb-5 lg:pb-[30px] p-5 lg:p-6">채팅</h1>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatList chatRooms={chatRooms} activeChatId={activeChatId} />
          </div>
        </aside>
        <main
          className={`${activeChatId ? 'flex' : 'hidden lg:flex'} flex-col w-full bg-gray-100 h-full`}
        >
          {children}
        </main>
      </div>
    </ChatRoomsContext.Provider>
  );
}
