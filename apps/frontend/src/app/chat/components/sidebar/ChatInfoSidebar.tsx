'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ChatRoomMemberRole, ChatRoomMemberResponse } from '@homerunnie/shared';
import { kickMember, deleteChatRoom } from '@/apis/chat/chat';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useChatRoomMembersQuery, chatKeys } from '@/hooks/chat/useChatQuery';
import MemberList from './MemberList';
import KickConfirmDialog from './KickConfirmDialog';
import DeleteRoomDialog from './DeleteRoomDialog';

interface ChatInfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: () => void;
  matchDate: string;
  matchTeam: string;
  role?: ChatRoomMemberRole;
  roomId: string;
}

const ChatInfoSidebar = ({
  isOpen,
  onClose,
  onReport,
  matchDate,
  matchTeam,
  role,
  roomId,
}: ChatInfoSidebarProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: members = [] } = useChatRoomMembersQuery(Number(roomId), isOpen);

  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set());
  const [kickTargets, setKickTargets] = useState<ChatRoomMemberResponse[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isKickMode, setIsKickMode] = useState(false);
  const isHost = role === ChatRoomMemberRole.HOST;

  const regularMembers = members.filter((m) => m.role !== ChatRoomMemberRole.HOST);

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const handleKickClick = () => {
    if (!isKickMode) {
      setIsKickMode(true);
      setSelectedMemberIds(new Set());
      return;
    }

    if (selectedMemberIds.size === 0) return;

    const targets = regularMembers.filter((m) => selectedMemberIds.has(m.memberId));
    if (targets.length > 0) {
      setKickTargets(targets);
    }
  };

  const handleKickConfirm = async () => {
    if (kickTargets.length === 0) return;
    try {
      await Promise.all(kickTargets.map((target) => kickMember(Number(roomId), target.memberId)));
      queryClient.invalidateQueries({ queryKey: chatKeys.roomMembers(Number(roomId)) });
      setSelectedMemberIds(new Set());
      setKickTargets([]);
      setIsKickMode(false);
    } catch (error) {
      console.error('강퇴 실패:', error);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await deleteChatRoom(Number(roomId));
      setShowDeleteModal(false);
      router.push('/chat');
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
    }
  };

  const handleLeaveRoom = () => {
    // TODO: 채팅방 나가기 로직 구현
    console.log('채팅방 나가기');
  };

  return (
    <>
      {/* 모바일 배경 딤 */}
      <div
        onClick={onClose}
        className={`lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden lg:h-full lg:shrink-0 max-lg:fixed max-lg:right-0 max-lg:top-0 max-lg:bottom-0 max-lg:z-50 max-lg:w-full sm:max-lg:w-96 ${
          isOpen ? 'lg:w-96 max-lg:translate-x-0' : 'lg:w-0 lg:border-0 max-lg:translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-t01-sb">상세정보</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="상세정보 닫기"
              className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div>
              <div className="text-b02-r flex flex-col py-[30px] px-5 gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-500 w-20">경기날짜</h3>
                  <p className="text-gray-900">{matchDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-gray-500 w-20">경기팀</h3>
                  <p className="text-gray-900">{matchTeam}</p>
                </div>
              </div>

              <MemberList
                members={members}
                isHost={isHost}
                isKickMode={isKickMode}
                selectedMemberIds={selectedMemberIds}
                onToggleSelection={toggleMemberSelection}
              />
            </div>
          </div>

          <div className="border-gray-200 py-[15px] px-5">
            <button
              onClick={onReport}
              className="w-full text-right text-b02-r text-gray-900 hover:text-gray-800 transition-colors mb-2 cursor-pointer"
            >
              신고하기
            </button>
            {isHost && (
              <button
                onClick={handleKickClick}
                className="w-full text-right text-b02-r text-red-500 hover:text-red-600 transition-colors mb-2 cursor-pointer"
              >
                내보내기
              </button>
            )}
            <button
              onClick={isHost ? () => setShowDeleteModal(true) : handleLeaveRoom}
              className="w-full text-right text-b02-r text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              채팅방 나가기
            </button>
          </div>
        </div>
      </div>

      <KickConfirmDialog
        targets={kickTargets}
        onConfirm={handleKickConfirm}
        onCancel={() => setKickTargets([])}
      />

      <DeleteRoomDialog
        open={showDeleteModal}
        onConfirm={handleDeleteRoom}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default ChatInfoSidebar;
