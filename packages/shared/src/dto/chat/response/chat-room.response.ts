import { ChatRoomMemberRole } from '../../../entities/chat/chat-room-member-role';

export interface ChatRoomResponse {
  id: number;
  postId: number;
  postTitle: string;
  role: ChatRoomMemberRole;
  teamHome: string | null;
  teamAway: string | null;
  gameDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}
