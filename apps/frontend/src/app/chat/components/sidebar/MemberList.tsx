'use client';

import { User, Check } from 'lucide-react';
import { ChatRoomMemberRole, ChatRoomMemberResponse } from '@homerunnie/shared';

interface MemberListProps {
  members: ChatRoomMemberResponse[];
  isHost: boolean;
  isKickMode: boolean;
  selectedMemberIds: Set<number>;
  onToggleSelection: (memberId: number) => void;
}

const MemberList = ({
  members,
  isHost,
  isKickMode,
  selectedMemberIds,
  onToggleSelection,
}: MemberListProps) => {
  const hostMember = members.find((m) => m.role === ChatRoomMemberRole.HOST);
  const regularMembers = members.filter((m) => m.role !== ChatRoomMemberRole.HOST);

  return (
    <div className="py-[30px] px-5 border-[1px]">
      <div className="flex items-center justify-between mb-[22px]">
        <h3 className="text-t04-sb text-gray-900">참여자</h3>
        <span className="text-b03-r text-gray-700">
          {String(members.length).padStart(2, '0')}명
        </span>
      </div>

      {/* 방장 프로필 */}
      {hostMember && (
        <div className="mb-[36px]">
          <p className="text-b03-r text-gray-600 mb-[8px]">{isHost ? '내 프로필' : '방장'}</p>
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
            onClick={isKickMode ? () => onToggleSelection(member.memberId) : undefined}
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
  );
};

export default MemberList;
