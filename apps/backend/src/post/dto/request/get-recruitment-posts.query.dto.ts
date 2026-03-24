import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { Stadium, Team } from '@/common/enums';

export class GetRecruitmentPostsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '통합 검색어(기본: 제목)', example: '잠실' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '제목 검색', example: '직관 같이' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: '경기 날짜(ISO 문자열)',
    example: '2026-03-29T09:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  gameDate?: string;

  @ApiPropertyOptional({ description: '경기 구장', enum: Stadium, example: Stadium.JAMSIL })
  @IsEnum(Stadium)
  @IsOptional()
  stadium?: Stadium;

  @ApiPropertyOptional({ description: '홈 팀', enum: Team, example: Team.DOOSAN })
  @IsEnum(Team)
  @IsOptional()
  teamA?: Team;

  @ApiPropertyOptional({ description: '원정 팀', enum: Team, example: Team.LG })
  @IsEnum(Team)
  @IsOptional()
  teamB?: Team;

  @ApiPropertyOptional({ description: '모집 인원', example: '2' })
  @IsNumberString()
  @IsOptional()
  headcount?: string;

  @ApiPropertyOptional({ description: '티켓 현황', enum: ['have', 'need'], example: 'have' })
  @IsEnum(['have', 'need'])
  @IsOptional()
  ticketStatus?: 'have' | 'need';

  @ApiPropertyOptional({ description: '응원하는 팀', enum: Team, example: Team.HANWHA })
  @IsEnum(Team)
  @IsOptional()
  favTeam?: Team;

  @ApiPropertyOptional({ description: '작성자 성별', enum: ['F', 'M'], example: 'M' })
  @IsEnum(['F', 'M'])
  @IsOptional()
  gender?: 'F' | 'M';

  @ApiPropertyOptional({ description: '선호 성별', enum: ['F', 'M', 'ANY'], example: 'ANY' })
  @IsEnum(['F', 'M', 'ANY'])
  @IsOptional()
  prefGender?: 'F' | 'M' | 'ANY';

  @ApiPropertyOptional({
    description: '성향 태그 배열(콤마 구분 문자열 또는 반복 쿼리 지원)',
    type: [String],
    example: ['CHEER_SONG', 'SUN_GOOD'],
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  picked?: string[];

  @ApiPropertyOptional({ description: '하고 싶은 말 검색', example: '맛있는거 먹기' })
  @IsString()
  @IsOptional()
  note?: string;
}
