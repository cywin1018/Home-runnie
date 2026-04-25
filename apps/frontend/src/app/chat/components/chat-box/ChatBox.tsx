'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInfo from './ChatInfo';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import ChatInfoSidebar from '../sidebar/ChatInfoSidebar';
import ReportModal, { ReportParticipant } from '@/shared/ui/modal/ReportModal';
import { useChatRooms } from '@/stores/ChatRoomsContext';
import { ChatRoomResponse, ChatRoomMemberRole } from '@homerunnie/shared';
import { useSocket } from '@/hooks/chat/useSocket';
import { useChatRoomMembersQuery } from '@/hooks/chat/useChatQuery';
import { formatKoreanDate, formatKoreanFullDate, formatTeamName, isSameDay } from '@/lib/format';

interface RoomInfo {
  title: string;
  matchDate: string;
  matchTeam: string;
  role: ChatRoomMemberRole;
}

const createRoomInfo = (room: ChatRoomResponse): RoomInfo => ({
  title: room.postTitle,
  matchDate: room.gameDate ? formatKoreanDate(new Date(room.gameDate)) : '-',
  matchTeam:
    room.teamHome && room.teamAway
      ? `${formatTeamName(room.teamHome)} vs ${formatTeamName(room.teamAway)}`
      : '-',
  role: room.role,
});

const FALLBACK_ROOM_INFO: RoomInfo = {
  title: '알 수 없는 방',
  matchDate: '-',
  matchTeam: '-',
  role: ChatRoomMemberRole.MEMBER,
};

const ChatBox = ({ roomId }: { roomId: string }) => {
  const router = useRouter();
  const chatRoomsMap = useChatRooms();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const {
    messages,
    sendMessage,
    connected,
    joinRequestCount,
    resetJoinRequestCount,
    kickedFromRoom,
    roomDeleted,
  } = useSocket(roomId);

  const { data: members = [] } = useChatRoomMembersQuery(Number(roomId));

  const reportParticipants: ReportParticipant[] = members.map((m) => ({
    memberId: m.memberId,
    nickname: m.nickname,
  }));

  const roomResponse = chatRoomsMap.get(roomId);
  const roomInfo = roomResponse ? createRoomInfo(roomResponse) : FALLBACK_ROOM_INFO;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (kickedFromRoom || roomDeleted) {
      alert(kickedFromRoom ? '채팅방에서 강퇴되었습니다.' : '채팅방이 삭제되었습니다.');
      router.push('/chat');
    }
  }, [kickedFromRoom, roomDeleted, router]);

  return (
    <div className="flex flex-row h-full w-full bg-gray-100 relative">
      <div className="flex flex-col h-full flex-1 min-w-0 transition-all duration-300 ease-in-out">
        <ChatInfo
          title={roomInfo.title}
          matchDate={roomInfo.matchDate}
          matchTeam={roomInfo.matchTeam}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          role={roomInfo.role}
          roomId={roomId}
          joinRequestCount={joinRequestCount}
          onJoinRequestOpen={resetJoinRequestCount}
        />
        <section className="flex flex-col flex-1 min-h-0 py-6 transition-all duration-300 ease-in-out">
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            participants={reportParticipants}
          />

          <div className="grow flex flex-col overflow-y-auto min-h-0">
            <div
              className={`mt-auto flex flex-col gap-4 ${
                isSidebarOpen ? 'px-4 lg:px-[30px]' : 'px-4 lg:px-8'
              }`}
            >
              {!connected && <p className="text-center text-sm text-gray-400">서버에 연결 중...</p>}
              {messages.map((msg, idx) => {
                const currentDate = msg.createdAt ? new Date(msg.createdAt) : null;
                const isCurrentValid = !!currentDate && !isNaN(currentDate.getTime());
                const prev = messages[idx - 1];
                const prevDate = prev?.createdAt ? new Date(prev.createdAt) : null;
                const isPrevValid = !!prevDate && !isNaN(prevDate.getTime());
                const showDateDivider =
                  isCurrentValid && (!isPrevValid || !isSameDay(prevDate!, currentDate!));

                return (
                  <Fragment key={msg.id}>
                    {showDateDivider && (
                      <div className="flex justify-center my-2">
                        <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1">
                          {formatKoreanFullDate(currentDate!)}
                        </span>
                      </div>
                    )}
                    <MessageBubble msg={msg} />
                  </Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={`shrink-0 ${isSidebarOpen ? 'px-4 lg:px-[30px]' : 'px-4 lg:px-8'}`}>
            <ChatInput onSend={sendMessage} />
          </div>
        </section>
      </div>

      <ChatInfoSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onReport={() => setIsReportModalOpen(true)}
        matchDate={roomInfo.matchDate}
        matchTeam={roomInfo.matchTeam}
        role={roomInfo.role}
        roomId={roomId}
      />
    </div>
  );
};

export default ChatBox;
