'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatInfo from './ChatInfo';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import ChatInfoSidebar from '../sidebar/ChatInfoSidebar';
import ReportModal, { ReportParticipant } from '@/shared/ui/modal/ReportModal';
import { useChatRooms } from '@/stores/ChatRoomsContext';
import { ChatRoomResponse, ChatRoomMemberRole, TeamDescription, Team } from '@homerunnie/shared';
import { useSocket } from '@/hooks/chat/useSocket';
import { useChatRoomMembersQuery } from '@/hooks/chat/useChatQuery';

interface RoomInfo {
  title: string;
  matchDate: string;
  matchTeam: string;
  role: ChatRoomMemberRole;
}

const formatKoreanDate = (date: Date): string => {
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\./g, '/')
    .replace(/\s/g, '');
};

const formatTeamName = (team: string | null): string => {
  if (!team) return '-';
  return TeamDescription[team as Team] ?? team;
};

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
        <section
          className={`flex flex-col flex-1 min-h-0 py-6 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'px-4 lg:px-[30px]' : 'px-4 lg:px-[120px]'
          }`}
        >
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            participants={reportParticipants}
          />

          <div className="grow flex flex-col justify-end gap-4 overflow-y-auto min-h-0 mb-6">
            {!connected && <p className="text-center text-sm text-gray-400">서버에 연결 중...</p>}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0">
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
