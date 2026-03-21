import { Module } from '@nestjs/common';
import { ReportRepository } from '@/report/repository';
import { ReportService } from '@/report/service';
import { ReportController } from '@/report/controller';
import { DbModule } from '@/common/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ReportController],
  providers: [ReportRepository, ReportService],
  exports: [ReportRepository],
})
export class ReportModule {}
