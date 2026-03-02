import { ApiProperty } from '@nestjs/swagger';
import { PostStatusEnum } from '@/common/enums/post-status.enum';

export class UpdateRecruitmentPostStatusResponseDto {
  @ApiProperty({ description: '게시글 ID', example: 1 })
  id: number;

  @ApiProperty({
    description: '변경된 모집글 상태',
    enum: [PostStatusEnum.ACTIVE, PostStatusEnum.CLOSE],
    example: PostStatusEnum.ACTIVE,
  })
  postStatus: PostStatusEnum.ACTIVE | PostStatusEnum.CLOSE;
}
