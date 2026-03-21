import { ApiProperty } from '@nestjs/swagger';
import { GetChatRoomsResponse } from '@homerunnie/shared';
import { ChatRoomResponseDto } from './chat-room.response.dto';

export class GetChatRoomsResponseDto implements GetChatRoomsResponse {
  @ApiProperty({
    description: '채팅방 목록',
    type: [ChatRoomResponseDto],
  })
  data: ChatRoomResponseDto[];

  @ApiProperty({
    description: '전체 개수',
    type: 'number',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: '현재 페이지',
    type: 'number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    type: 'number',
    example: 20,
  })
  limit: number;

  constructor(data: ChatRoomResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }

  static from(
    chatRooms: {
      id: number;
      postId: number;
      postTitle?: string | null;
      createdAt: Date;
      updatedAt: Date;
      role: string;
    }[],
    total: number,
    page: number,
    limit: number,
  ): GetChatRoomsResponseDto {
    const data = chatRooms.map((room) => ChatRoomResponseDto.from(room));
    return new GetChatRoomsResponseDto(data, total, page, limit);
  }
}
