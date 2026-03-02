import { ApiProperty } from '@nestjs/swagger';

export class GetRecruitmentPostDetailResponseDto {
  @ApiProperty({ description: '게시글 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '게시글 제목', example: '한화 vs 두산 직관 같이 가실 분 구해요!' })
  title: string;

  @ApiProperty({ description: '작성자 닉네임', nullable: true, example: '야구왕타돌이' })
  authorNickname: string | null;

  @ApiProperty({ description: '작성자 회원 ID', example: 1 })
  authorId: number;

  @ApiProperty({ description: '게시글 상태', example: 'ACTIVE' })
  postStatus: string;

  @ApiProperty({ description: '경기 날짜', example: '2026-03-10T18:30:00.000Z' })
  gameDate: string;

  @ApiProperty({ description: '경기 시간', example: '2026-03-10T18:30:00.000Z' })
  gameTime: string;

  @ApiProperty({ description: '경기장', example: 'JAMSIL' })
  stadium: string;

  @ApiProperty({ description: '홈 팀', example: 'HANWHA' })
  teamHome: string;

  @ApiProperty({ description: '원정 팀', example: 'DOOSAN' })
  teamAway: string;

  @ApiProperty({ description: '모집 인원', example: 3 })
  recruitmentLimit: number;

  @ApiProperty({ description: '현재 참여 인원', example: 1 })
  currentParticipants: number;

  @ApiProperty({ description: '작성자 성별', nullable: true, example: 'MALE' })
  gender: string | null;

  @ApiProperty({ description: '선호 성별', example: 'ANY' })
  preferGender: string;

  @ApiProperty({
    description: '작성자 성향 태그',
    nullable: true,
    type: [String],
    example: ['응원가 부르는거 좋아해요', '햇빛 싫어요'],
  })
  picked: string[] | null;

  @ApiProperty({ description: '메모', nullable: true, example: '즐겁게 직관해요!' })
  message: string | null;

  @ApiProperty({ description: '티켓 타입', nullable: true, example: 'SEPARATE' })
  ticketingType: string | null;

  @ApiProperty({ description: '응원팀', nullable: true, example: 'HANWHA' })
  supportTeam: string | null;

  @ApiProperty({ description: '생성 일시', example: '2026-03-01T12:00:00.000Z' })
  createdAt: string;
}
