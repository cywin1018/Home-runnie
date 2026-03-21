import { ApiProperty } from '@nestjs/swagger';
import { ChatRoomResponse, ChatRoomMemberRole } from '@homerunnie/shared';

export class ChatRoomResponseDto implements ChatRoomResponse {
  @ApiProperty({
    description: '채팅방 ID',
    type: 'number',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '게시글 ID',
    type: 'number',
    example: 123,
  })
  postId: number;

  @ApiProperty({
    description: '게시글 제목',
    type: 'string',
    example: '한화 vs 기아 직관 같이 가실 분',
  })
  postTitle: string;

  @ApiProperty({
    description: '현재 사용자의 역할',
    enum: ChatRoomMemberRole,
    example: ChatRoomMemberRole.HOST,
  })
  role: ChatRoomMemberRole;

  @ApiProperty({
    description: '홈팀',
    type: 'string',
    example: 'HANWHA',
    nullable: true,
  })
  teamHome: string | null;

  @ApiProperty({
    description: '원정팀',
    type: 'string',
    example: 'KIA',
    nullable: true,
  })
  teamAway: string | null;

  @ApiProperty({
    description: '경기 날짜',
    type: 'string',
    example: '2024-05-01T18:30:00',
    nullable: true,
  })
  gameDate: string | null;

  @ApiProperty({
    description: '생성 일시',
    type: 'string',
    example: '2024-01-17T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    type: 'string',
    example: '2024-01-17T12:00:00Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<ChatRoomResponseDto>) {
    Object.assign(this, partial);
  }

  static from(data: {
    id: number;
    postId: number;
    postTitle?: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: string;
    teamHome?: string | null;
    teamAway?: string | null;
    gameDate?: string | null;
  }): ChatRoomResponseDto {
    return new ChatRoomResponseDto({
      id: data.id,
      postId: data.postId,
      postTitle: data.postTitle ?? `채팅방 ${data.id}`,
      role: data.role as ChatRoomMemberRole,
      teamHome: data.teamHome ?? null,
      teamAway: data.teamAway ?? null,
      gameDate: data.gameDate ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
