import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { PostService } from '@/post/service';
import {
  CreateRecruitmentPostRequestDto,
  CreateRecruitmentPostResponseDto,
  GetRecruitmentPostsQueryDto,
  GetRecruitmentPostDetailResponseDto,
  GetRecruitmentPostsResponseDto,
  UpdateRecruitmentPostStatusRequestDto,
  UpdateRecruitmentPostStatusResponseDto,
} from '@/post/dto';
import { CurrentMember } from '@/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateRecruitmentPostSwagger } from '@/post/swagger';

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
    @Query() query: GetRecruitmentPostsQueryDto,
  ): Promise<GetRecruitmentPostsResponseDto> {
    return this.postService.getRecruitmentPosts(query);
  }

  @Get('recruitment/:postId')
  async getRecruitmentPostDetail(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<GetRecruitmentPostDetailResponseDto> {
    return this.postService.getRecruitmentPostDetail(postId);
  }

  @Delete('recruitment/:postId')
  @UseGuards(JwtAuthGuard)
  async deleteRecruitmentPost(
    @CurrentMember() memberId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.deleteRecruitmentPost(memberId, postId);
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
