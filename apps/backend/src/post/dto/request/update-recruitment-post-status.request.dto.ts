import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PostStatusEnum } from '@/common/enums/post-status.enum';

export class UpdateRecruitmentPostStatusRequestDto {
  @ApiProperty({
    description: '변경할 모집글 상태',
    enum: [PostStatusEnum.ACTIVE, PostStatusEnum.CLOSE],
    example: PostStatusEnum.CLOSE,
  })
  @IsEnum([PostStatusEnum.ACTIVE, PostStatusEnum.CLOSE])
  postStatus: PostStatusEnum.ACTIVE | PostStatusEnum.CLOSE;
}
