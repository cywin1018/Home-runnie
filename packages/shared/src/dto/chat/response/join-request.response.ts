import { ChatJoinRequestStatus } from '../../../entities/chat/chat-join-request-status';

export interface JoinRequestResponse {
  id: number;
  memberId: number;
  nickname: string;
  gender: string | null;
  birthDate: string | null;
  supportTeam: string | null;
  chatRoomId: number;
  status: ChatJoinRequestStatus;
  createdAt: Date;
}
