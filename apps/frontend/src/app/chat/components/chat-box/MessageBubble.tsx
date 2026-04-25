import Image from 'next/image';
import { Team, TEAM_ASSETS, DEFAULT_PROFILE_IMAGE } from '@homerunnie/shared';
import { ChatMessage } from '@/hooks/chat/useSocket';
import { formatKoreanTime } from '@/lib/format';

interface MessageBubbleProps {
  msg: ChatMessage;
  onProfileClick?: (info: { nickname: string; supportTeam: string | null }) => void;
}

const MessageBubble = ({ msg, onProfileClick }: MessageBubbleProps) => {
  if (msg.sender === 'system') {
    return (
      <div className="flex justify-center">
        <p className="text-xs text-gray-400 bg-gray-200 rounded-full px-3 py-1">{msg.text}</p>
      </div>
    );
  }

  const isMe = msg.sender === 'me';
  const showProfile = !isMe && msg.nickname;
  const date = msg.createdAt ? new Date(msg.createdAt) : null;
  const time = date && !isNaN(date.getTime()) ? formatKoreanTime(date) : '';

  const handleProfileClick = () => {
    if (!onProfileClick || !msg.nickname) return;
    onProfileClick({ nickname: msg.nickname, supportTeam: msg.supportTeam });
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div>
        {showProfile && (
          <button
            type="button"
            onClick={handleProfileClick}
            className="text-sm text-gray-500 mb-1 hover:underline"
          >
            {msg.nickname}
          </button>
        )}
        <div className="flex items-end gap-2">
          {showProfile && (
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-8 h-8 rounded-full overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label={`${msg.nickname} 프로필 보기`}
            >
              <Image
                src={
                  (msg.supportTeam && TEAM_ASSETS[msg.supportTeam as Team]?.image) ||
                  DEFAULT_PROFILE_IMAGE
                }
                alt={msg.nickname}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </button>
          )}
          {isMe && time && <span className="text-xs text-gray-400 shrink-0">{time}</span>}
          <div
            className={[
              'rounded-2xl px-4 py-2 max-w-xs lg:max-w-md',
              isMe
                ? 'bg-green-500 text-white rounded-br-none'
                : 'bg-white text-black rounded-bl-none',
            ].join(' ')}
          >
            {msg.text}
          </div>
          {!isMe && time && <span className="text-xs text-gray-400 shrink-0">{time}</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
