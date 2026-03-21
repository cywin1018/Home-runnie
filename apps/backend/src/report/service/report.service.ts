import { Injectable, BadRequestException } from '@nestjs/common';
import { ReportRepository } from '@/report/repository';
import { ReportType } from '@/common/enums';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(
    reporterId: number,
    reportedId: number,
    reportType: ReportType,
    content?: string,
  ) {
    if (reporterId === reportedId) {
      throw new BadRequestException('자기 자신을 신고할 수 없습니다.');
    }

    return this.reportRepository.createReport(reporterId, reportedId, reportType, content);
  }
}
