import { ApiProperty } from '@nestjs/swagger';
import { Member, Profile } from '@/member/domain';
import { Warn } from '@/admin/domain';
import { GetMyProfileResponse } from '@homerunnie/shared';
import { Team } from '@homerunnie/shared';

export class GetMyProfileResponseDto implements GetMyProfileResponse {
  @ApiProperty({
    description: '회원 ID',
    type: 'integer',
    example: 1,
  })
  memberId: number;

  @ApiProperty({
    description: '닉네임',
    type: 'string',
    example: '야구왕타돌이',
  })
  nickname: string;

  @ApiProperty({
    description: '응원하는 KBO 팀',
    type: 'string',
    nullable: true,
    example: 'LG',
  })
  supportTeam: Team | null;

  @ApiProperty({
    description: '로그인 방법 (OAuth 제공자)',
    type: 'string',
    example: 'KAKAO',
  })
  oauthProvider: string;

  @ApiProperty({
    description: '계정 활성 상태',
    type: 'string',
    example: 'ACTIVE',
  })
  accountStatus: string;

  @ApiProperty({
    description: '누적 경고 횟수',
    type: 'integer',
    example: 3,
  })
  warnCount: number;

  static from(
    member: typeof Member.$inferSelect,
    profile: typeof Profile.$inferSelect,
    warns: (typeof Warn.$inferSelect)[],
  ): GetMyProfileResponseDto {
    const response = new GetMyProfileResponseDto();
    response.memberId = member.id;
    response.nickname = profile.nickname;
    response.supportTeam = profile.supportTeam as Team;
    response.oauthProvider = member.oauthProvider;
    response.accountStatus = member.accountStatus;
    response.warnCount = warns.length;
    return response;
  }
}
