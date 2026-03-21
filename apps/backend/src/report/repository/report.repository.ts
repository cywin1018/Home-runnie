import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Report } from '@/report/domain';
import { eq } from 'drizzle-orm';
import { ReportType } from '@/common/enums';

@Injectable()
export class ReportRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: ReturnType<typeof drizzle>,
  ) {}

  async findByMemberId(memberId: number) {
    const [reportingRecords, reportedRecords] = await Promise.all([
      this.db.select().from(Report).where(eq(Report.reporterId, memberId)),
      this.db.select().from(Report).where(eq(Report.reportedId, memberId)),
    ]);

    return { reportingRecords, reportedRecords };
  }

  async createReport(
    reporterId: number,
    reportedId: number,
    reportType: ReportType,
    content?: string,
  ) {
    const [report] = await this.db
      .insert(Report)
      .values({ reporterId, reportedId, reportType, content })
      .returning();

    return report;
  }
}
