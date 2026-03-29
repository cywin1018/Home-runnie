'use client';

import { useRouter } from 'next/navigation';
import { ChatRoomMemberRole } from '@homerunnie/shared';
import { ChatListItem } from '../layout';

interface ChatListProps {
  chatRooms?: ChatListItem[];
  activeChatId?: string;
}

const ChatList = ({ chatRooms, activeChatId }: ChatListProps) => {
  const router = useRouter();

  const handleChatRoomClick = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-y-auto">
      {chatRooms && chatRooms.length > 0 ? (
        chatRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => handleChatRoomClick(room.id)}
            className={`p-4 cursor-pointer border-b border-gray-100 ${
              room.id === activeChatId ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg mb-1">{room.title}</h2>
                {room.role === ChatRoomMemberRole.HOST && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    방장
                  </span>
                )}
              </div>
              {room.unreadCount > 0 && (
                <span className="bg-green-500 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                  {room.unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate mb-1">{room.participants.join(', ')}</p>
            <p className="text-sm text-gray-700 truncate">{room.lastMessage}</p>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>채팅방이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
