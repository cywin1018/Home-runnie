'use client';

import { useState, useRef, useEffect } from 'react';
import { Mail, Menu } from 'lucide-react';
import { ChatRoomMemberRole } from '@homerunnie/shared';
import JoinRequestDropdown from './JoinRequestDropdown';

interface ChatInfoProps {
  title: string;
  matchDate: string;
  matchTeam: string;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  role?: ChatRoomMemberRole;
  roomId: string;
  joinRequestCount?: number;
  onJoinRequestOpen?: () => void;
}

const ChatInfo = ({
  title,
  matchDate,
  matchTeam,
  onToggleSidebar,
  isSidebarOpen,
  role,
  roomId,
  joinRequestCount = 0,
  onJoinRequestOpen,
}: ChatInfoProps) => {
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isHost = role === ChatRoomMemberRole.HOST;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowJoinRequests(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMailClick = () => {
    setShowJoinRequests((prev) => !prev);
    onJoinRequestOpen?.();
  };

  return (
    <div className="bg-white shadow-sm px-[20px] py-[16px] w-full">
      <div className="flex items-center justify-between">
        <div className="justify-center items-center flex gap-[24px]">
          <h1 className="text-t01-sb text-gray-900">{title}</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-c01-r justify-center">
              <span className="text-gray-600">경기날짜</span>
              <span className="text-gray-800">{matchDate}</span>
            </div>
            <div className="flex items-center gap-2 text-c01-r">
              <span className="text-gray-600">경기팀</span>
              <span className="text-gray-800">{matchTeam}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isHost && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleMailClick}
                className="relative p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                aria-label="참여 요청"
              >
                <Mail className="w-6 h-6 text-gray-600" />
                {joinRequestCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {joinRequestCount}
                  </span>
                )}
              </button>
              {showJoinRequests && <JoinRequestDropdown roomId={roomId} />}
            </div>
          )}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            aria-label="사이드바"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInfo;
