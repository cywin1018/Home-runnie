import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { MemberService } from '@/member/service';
import { CreateMemberRequestDto, UpdateMyProfileRequestDto } from '@/member/dto';
import {
  CreateMemberSwagger,
  GetMyProfileSwagger,
  GetScrappedRecruitmentsSwagger,
  GetWrittenRecruitmentsSwagger,
  GetParticipatedRecruitmentsSwagger,
  UpdateMyProfileSwagger,
  MemberControllerSwagger,
} from '@/member/swagger';
import { CurrentMember, PaginationQueryDto } from '@/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('member')
@MemberControllerSwagger
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @CreateMemberSwagger
  async signUp(@Body() createMemberDto: CreateMemberRequestDto) {
    const { name, email } = createMemberDto;
    await this.memberService.createMember(name, email);
  }

  @Get('my')
  @GetMyProfileSwagger
  async getMyInfo(@CurrentMember() memberId: number) {
    return await this.memberService.getMyProfile(memberId);
  }

  @Put('my')
  @UpdateMyProfileSwagger
  async updateMyProfile(
    @CurrentMember() memberId: number,
    @Body() updateProfileDto: UpdateMyProfileRequestDto,
  ) {
    return await this.memberService.updateMyProfile(memberId, updateProfileDto);
  }

  @Get('my/scrapped-recruitments')
  @GetScrappedRecruitmentsSwagger
  async getScrappedRecruitments(
    @CurrentMember() memberId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.memberService.getMyScrappedRecruitments(
      memberId,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
  }

  @Get('my/written-recruitments')
  @GetWrittenRecruitmentsSwagger
  async getWrittenRecruitments(
    @CurrentMember() memberId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.memberService.getMyWrittenRecruitments(
      memberId,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
  }

  @Get('my/participated-recruitments')
  @GetParticipatedRecruitmentsSwagger
  async getParticipatedRecruitments(
    @CurrentMember() memberId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.memberService.getMyParticipatedRecruitments(
      memberId,
      paginationQuery.page,
      paginationQuery.pageSize,
    );
  }
}
