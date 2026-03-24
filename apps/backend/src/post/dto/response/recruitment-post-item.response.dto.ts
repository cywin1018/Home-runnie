import { ApiProperty } from '@nestjs/swagger';

export class RecruitmentPostItemResponseDto {
  @ApiProperty({ description: '게시글 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '게시글 제목', example: '한화 vs 두산 직관 같이 가실 분 구해요!' })
  title: string;

  @ApiProperty({ description: '경기 날짜', example: '2026-03-10' })
  gameDate: string;

  @ApiProperty({ description: '홈 팀', example: 'HANWHA' })
  teamHome: string;

  @ApiProperty({ description: '원정 팀', example: 'DOOSAN' })
  teamAway: string;

  @ApiProperty({ description: '모집 상태', example: 'ACTIVE' })
  postStatus: string;

  @ApiProperty({ description: '작성자 닉네임', example: '야구좋아', nullable: true })
  authorNickname: string | null;

  @ApiProperty({ description: '생성 일시', example: '2026-03-01T12:00:00.000Z' })
  createdAt: string;

  constructor(partial: Partial<RecruitmentPostItemResponseDto>) {
    Object.assign(this, partial);
  }
}
