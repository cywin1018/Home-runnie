import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ReportType } from '@/common/enums';

export class CreateReportRequestDto {
  @ApiProperty({ description: '신고 대상 회원 ID', example: 2 })
  @IsInt()
  reportedId: number;

  @ApiProperty({ description: '신고 유형', enum: ReportType, example: ReportType.HARASSMENT })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({ description: '신고 내용', required: false, example: '욕설을 사용했습니다.' })
  @IsOptional()
  @IsString()
  content?: string;
}
