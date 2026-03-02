import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { PostService } from '@/post/service';
import {
  CreateRecruitmentPostRequestDto,
  CreateRecruitmentPostResponseDto,
  GetRecruitmentPostDetailResponseDto,
  GetRecruitmentPostsResponseDto,
  UpdateRecruitmentPostStatusRequestDto,
  UpdateRecruitmentPostStatusResponseDto,
} from '@/post/dto';
import { CurrentMember } from '@/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateRecruitmentPostSwagger } from '@/post/swagger';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('recruitment')
  @UseGuards(JwtAuthGuard)
  @CreateRecruitmentPostSwagger
  async createRecruitmentPost(
    @CurrentMember() memberId: number,
    @Body() createRecruitmentPostDto: CreateRecruitmentPostRequestDto,
  ): Promise<CreateRecruitmentPostResponseDto> {
    return await this.postService.createRecruitmentPost(memberId, createRecruitmentPostDto);
  }

  @Get('recruitment')
  async getRecruitmentPosts(
    @Query() query: PaginationQueryDto,
  ): Promise<GetRecruitmentPostsResponseDto> {
    return this.postService.getRecruitmentPosts(query.page, query.pageSize);
  }

  @Get('recruitment/:postId')
  async getRecruitmentPostDetail(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<GetRecruitmentPostDetailResponseDto> {
    return this.postService.getRecruitmentPostDetail(postId);
  }

  @Patch('recruitment/:postId/status')
  @UseGuards(JwtAuthGuard)
  async updateRecruitmentPostStatus(
    @CurrentMember() memberId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: UpdateRecruitmentPostStatusRequestDto,
  ): Promise<UpdateRecruitmentPostStatusResponseDto> {
    return this.postService.updateRecruitmentPostStatus(memberId, postId, dto);
  }
}
