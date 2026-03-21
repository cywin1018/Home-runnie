import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from '@/report/service';
import { CreateReportRequestDto } from '@/report/dto';
import { CurrentMember } from '@/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('신고')
@Controller('report')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: '신고 접수' })
  async createReport(@CurrentMember() memberId: number, @Body() dto: CreateReportRequestDto) {
    await this.reportService.createReport(memberId, dto.reportedId, dto.reportType, dto.content);

    return { message: '신고가 접수되었습니다.' };
  }
}
