'use client';

import { useState } from 'react';
import { User, Check, X } from 'lucide-react';
import { ChatRoomMemberRole, ChatRoomMemberResponse } from '@homerunnie/shared';
import { kickMember, deleteChatRoom } from '@/apis/chat/chat';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useChatRoomMembersQuery, chatKeys } from '@/hooks/chat/useChatQuery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/primitives/dialog';

interface ChatInfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: () => void;
  title: string;
  matchDate: string;
  matchTeam: string;
  role?: ChatRoomMemberRole;
  roomId: string;
}

const ChatInfoSidebar = ({
  isOpen,
  onClose,
  onReport,
  title,
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
      for (const target of kickTargets) {
        await kickMember(Number(roomId), target.memberId);
      }
      // 캐시 무효화하여 멤버 목록 갱신
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

  const hostMember = members.find((m) => m.role === ChatRoomMemberRole.HOST);
  const regularMembers = members.filter((m) => m.role !== ChatRoomMemberRole.HOST);

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
              <div className="text-b02-r flex flex-col py-[30px] px-5 gap-[16px]">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-500 w-20">경기날짜</h3>
                  <p className="text-gray-900">{matchDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-gray-500 w-20">경기팀</h3>
                  <p className="text-gray-900">{matchTeam}</p>
                </div>
              </div>

              <div className="py-[30px] px-5 border-[1px]">
                <div className="flex items-center justify-between mb-[22px]">
                  <h3 className="text-t04-sb text-gray-900">참여자</h3>
                  <span className="text-b03-r text-gray-700">
                    {String(members.length).padStart(2, '0')}명
                  </span>
                </div>

                {/* 방장 (내 프로필) */}
                {hostMember && isHost && (
                  <div className="mb-[36px]">
                    <p className="text-b03-r text-gray-600 mb-[8px]">내 프로필</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-b02-r text-gray-600">{hostMember.nickname}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 방장이 아닌 경우 방장 표시 */}
                {hostMember && !isHost && (
                  <div className="mb-[36px]">
                    <p className="text-b03-r text-gray-600 mb-[8px]">방장</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-b02-r text-gray-600">{hostMember.nickname}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 멤버 목록 */}
                <div className="space-y-3">
                  {regularMembers.map((member) => (
                    <div
                      key={member.memberId}
                      className={`flex items-center gap-[12px] ${isKickMode ? 'cursor-pointer' : ''}`}
                      onClick={
                        isKickMode ? () => toggleMemberSelection(member.memberId) : undefined
                      }
                    >
                      {isKickMode && (
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                            selectedMemberIds.has(member.memberId)
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedMemberIds.has(member.memberId) && (
                            <Check className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      )}
                      <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-b02-r text-gray-900">{member.nickname}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-gray-200 py-[15px] px-[20px]">
            <button
              onClick={onReport}
              className="w-full text-right text-b02-r text-gray-900 hover:text-gray-800 transition-colors mb-[8px] cursor-pointer"
            >
              신고하기
            </button>
            {isHost && (
              <button
                onClick={handleKickClick}
                className="w-full text-right text-b02-r text-red-500 hover:text-red-600 transition-colors mb-[8px] cursor-pointer"
              >
                내보내기
              </button>
            )}
            {isHost ? (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full text-right text-b02-r text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                채팅방 나가기
              </button>
            ) : (
              <button
                onClick={handleLeaveRoom}
                className="w-full text-right text-b02-r text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                채팅방 나가기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 내보내기 확인 모달 */}
      <Dialog open={kickTargets.length > 0} onOpenChange={() => setKickTargets([])}>
        <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-10">
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-bold text-center">
              {kickTargets.map((t) => t.nickname).join(', ')} 님을 내보내시겠어요?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 mt-2">
              내보내면{' '}
              {kickTargets.length === 1
                ? `${kickTargets[0].nickname}님은`
                : `${kickTargets.length}명은`}{' '}
              더 이상 이 채팅방을 이용할 수 없어요
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setKickTargets([])}
              className="flex-1 py-4 rounded-lg border border-gray-200 text-gray-900 text-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleKickConfirm}
              className="flex-1 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              내보내기
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 채팅방 삭제 확인 모달 */}
      <Dialog open={showDeleteModal} onOpenChange={() => setShowDeleteModal(false)}>
        <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-10">
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-bold text-center">
              채팅방을 삭제하시겠어요?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 mt-2">
              삭제하면 모든 대화 내용이 사라지고 되돌릴 수 없어요
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-4 rounded-lg border border-gray-200 text-gray-900 text-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleDeleteRoom}
              className="flex-1 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
            >
              삭제하기
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatInfoSidebar;
