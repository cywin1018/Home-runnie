import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentMember } from '@/common';
import { CommentService } from '@/comment/service';
import { CreateRecruitmentCommentRequestDto, RecruitmentCommentResponseDto } from '@/comment/dto';

@Controller('post/recruitment/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async getRecruitmentComments(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<RecruitmentCommentResponseDto[]> {
    return this.commentService.getRecruitmentComments(postId);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @CurrentMember() memberId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentService.deleteComment(memberId, postId, commentId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRecruitmentComment(
    @CurrentMember() memberId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateRecruitmentCommentRequestDto,
  ): Promise<RecruitmentCommentResponseDto> {
    return this.commentService.createRecruitmentComment(memberId, postId, dto);
  }
}
