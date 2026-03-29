import { ApiProperty } from '@nestjs/swagger';
import { JoinRequestResponse, ChatJoinRequestStatus } from '@homerunnie/shared';

export class JoinRequestResponseDto implements JoinRequestResponse {
  @ApiProperty({ description: '요청 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '요청자 멤버 ID', example: 2 })
  memberId: number;

  @ApiProperty({ description: '닉네임', example: '수비니' })
  nickname: string;

  @ApiProperty({ description: '성별', example: '여자', nullable: true })
  gender: string | null;

  @ApiProperty({ description: '생년월일', example: '1999-01-01', nullable: true })
  birthDate: string | null;

  @ApiProperty({ description: '응원팀', example: 'DOOSAN', nullable: true })
  supportTeam: string | null;

  @ApiProperty({ description: '채팅방 ID', example: 1 })
  chatRoomId: number;

  @ApiProperty({
    description: '요청 상태',
    enum: ChatJoinRequestStatus,
    example: ChatJoinRequestStatus.PENDING,
  })
  status: ChatJoinRequestStatus;

  @ApiProperty({ description: '요청 일시', example: '2024-01-17T12:00:00Z' })
  createdAt: Date;

  constructor(partial: Partial<JoinRequestResponseDto>) {
    Object.assign(this, partial);
  }

  static from(data: {
    id: number;
    memberId: number;
    nickname: string;
    gender: string | null;
    birthDate: string | null;
    supportTeam?: string | null;
    chatRoomId: number;
    status: string;
    createdAt: Date;
  }): JoinRequestResponseDto {
    return new JoinRequestResponseDto({
      id: data.id,
      memberId: data.memberId,
      nickname: data.nickname,
      gender: data.gender,
      birthDate: data.birthDate,
      supportTeam: data.supportTeam ?? null,
      chatRoomId: data.chatRoomId,
      status: data.status as ChatJoinRequestStatus,
      createdAt: data.createdAt,
    });
  }
}
