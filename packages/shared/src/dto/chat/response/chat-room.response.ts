import { ChatRoomMemberRole } from '../../../entities/chat/chat-room-member-role';

export interface ChatRoomResponse {
  id: number;
  postId: number;
  postTitle: string;
  role: ChatRoomMemberRole;
  createdAt: Date;
  updatedAt: Date;
}
