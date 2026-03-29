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
  createdAt: Date;
  updatedAt: Date;
}
