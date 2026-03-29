import { ChatRoomMemberRole } from '../../../entities/chat/chat-room-member-role';

export interface ChatRoomResponse {
  id: number;
  postId: number;
  postTitle: string;
  role: ChatRoomMemberRole;
  teamHome: string | null;
  teamAway: string | null;
  gameDate: string | null;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
