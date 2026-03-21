'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInfo from './ChatInfo';
import ChatInput from './ChatInput';
import ChatReport from './ChatReport';
import ChatInfoSidebar from './ChatInfoSidebar';
import { useChatRooms } from '@/stores/ChatRoomsContext';
import { getMyChatRooms, getChatRoomMembers } from '@/apis/chat/chat';
import { ChatRoomResponse, ChatRoomMemberRole, TeamDescription, Team } from '@homerunnie/shared';
import { useState } from 'react';
import { useSocket } from '@/hooks/chat/useSocket';
import { ReportParticipant } from '@/shared/ui/modal/ReportModal';

interface RoomInfo {
  title: string;
  matchDate: string;
  matchTeam: string;
  role: ChatRoomMemberRole;
}

interface RoomData {
  info: RoomInfo;
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

const createRoomData = (room: ChatRoomResponse): RoomData => {
  return {
    info: {
      title: room.postTitle,
      matchDate: room.gameDate ? formatKoreanDate(new Date(room.gameDate)) : '-',
      matchTeam:
        room.teamHome && room.teamAway
          ? `${formatTeamName(room.teamHome)} vs ${formatTeamName(room.teamAway)}`
          : '-',
      role: room.role,
    },
  };
};

const ChatBox = ({ roomId }: { roomId: string }) => {
  const router = useRouter();
  const chatRoomsMap = useChatRooms();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportParticipants, setReportParticipants] = useState<ReportParticipant[]>([]);
  const {
    messages,
    sendMessage,
    connected,
    joinRequestCount,
    resetJoinRequestCount,
    kickedFromRoom,
    roomDeleted,
  } = useSocket(roomId);

  useEffect(() => {
    if (kickedFromRoom || roomDeleted) {
      alert(kickedFromRoom ? '채팅방에서 강퇴되었습니다.' : '채팅방이 삭제되었습니다.');
      router.push('/chat');
    }
  }, [kickedFromRoom, roomDeleted, router]);

  // 채팅방 멤버 목록 조회
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await getChatRoomMembers(Number(roomId));
        setReportParticipants(members.map((m) => ({ memberId: m.memberId, nickname: m.nickname })));
      } catch (error) {
        console.error('멤버 목록 조회 실패:', error);
      }
    };
    fetchMembers();
  }, [roomId]);

  // 채팅방 정보를 API에서 가져오기
  useEffect(() => {
    const fetchRoomData = async () => {
      // Context에서 채팅방 정보 찾기
      const roomInfo = chatRoomsMap.get(roomId);
      if (roomInfo) {
        setRoomData(createRoomData(roomInfo));
        return;
      }

      // Context에 없으면 API로 채팅방 목록 조회해서 찾기
      setLoading(true);
      try {
        const response = await getMyChatRooms(1, 100);
        const foundRoom = response.data.find((room) => String(room.id) === roomId);

        if (foundRoom) {
          setRoomData(createRoomData(foundRoom));
        } else {
          setRoomData({
            info: {
              title: '알 수 없는 방',

              matchDate: '-',
              matchTeam: '-',
              role: ChatRoomMemberRole.MEMBER,
            },
          });
        }
      } catch (error) {
        console.error('채팅방 정보 조회 실패:', error);
        setRoomData({
          info: {
            title: '알 수 없는 방',
            matchDate: '-',
            matchTeam: '-',
            role: ChatRoomMemberRole.MEMBER,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, chatRoomsMap]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-gray-400">채팅방 정보를 불러오는 중...</p>
      </div>
    );
  }

  const currentRoomData = roomData;

  return (
    <div className="flex flex-row h-full w-full bg-gray-100 relative">
      {/* 채팅 영역 */}
      <div className="flex flex-col h-full flex-1 min-w-0 transition-all duration-300 ease-in-out">
        <ChatInfo
          title={currentRoomData.info.title}
          matchDate={currentRoomData.info.matchDate}
          matchTeam={currentRoomData.info.matchTeam}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          role={currentRoomData.info.role}
          roomId={roomId}
          joinRequestCount={joinRequestCount}
          onJoinRequestOpen={resetJoinRequestCount}
        />
        <section
          className={`flex flex-col h-full py-6 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'px-[30px]' : 'px-[120px]'
          }`}
        >
          <ChatReport
            isModalOpen={isReportModalOpen}
            onOpenModal={() => setIsReportModalOpen(true)}
            onCloseModal={() => setIsReportModalOpen(false)}
            participants={reportParticipants}
          />

          <div className="grow flex flex-col justify-end gap-4 overflow-y-auto mb-6">
            {!connected && <p className="text-center text-sm text-gray-400">서버에 연결 중...</p>}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div>
                  {msg.sender === 'other' && msg.nickname && (
                    <p className="text-sm text-gray-500 mb-1">{msg.nickname}</p>
                  )}
                  <div className="flex items-end gap-2">
                    {msg.sender === 'other' && msg.nickname && (
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                        <span className="text-pink-500 text-xs">{msg.nickname.charAt(0)}</span>
                      </div>
                    )}
                    <div
                      className={[
                        'rounded-2xl px-4 py-2 max-w-xs lg:max-w-md',
                        msg.sender === 'me'
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white text-black rounded-bl-none',
                      ].join(' ')}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0">
            <ChatInput onSend={sendMessage} />
          </div>
        </section>
      </div>

      {/* 사이드바 */}
      <ChatInfoSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onReport={() => setIsReportModalOpen(true)}
        title={currentRoomData.info.title}
        matchDate={currentRoomData.info.matchDate}
        matchTeam={currentRoomData.info.matchTeam}
        role={currentRoomData.info.role}
        roomId={roomId}
      />
    </div>
  );
};

export default ChatBox;
