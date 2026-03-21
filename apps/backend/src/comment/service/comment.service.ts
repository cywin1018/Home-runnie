import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '@/comment/repository';
import { CreateRecruitmentCommentRequestDto, RecruitmentCommentResponseDto } from '@/comment/dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async getRecruitmentComments(postId: number): Promise<RecruitmentCommentResponseDto[]> {
    const exists = await this.commentRepository.existsRecruitmentPost(postId);
    if (!exists) {
      throw new NotFoundException('해당 모집글을 찾을 수 없습니다.');
    }

    const comments = await this.commentRepository.findRecruitmentComments(postId);
    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      authorNickname: comment.authorNickname,
      createdAt: comment.createdAt.toISOString(),
    }));
  }

  async deleteComment(memberId: number, postId: number, commentId: number) {
    const comment = await this.commentRepository.findCommentById(commentId, postId);
    if (!comment) {
      throw new NotFoundException('해당 댓글을 찾을 수 없습니다.');
    }
    if (comment.authorId !== memberId) {
      throw new ForbiddenException('작성자만 삭제할 수 있습니다.');
    }

    await this.commentRepository.softDeleteComment(commentId, postId);
    return { id: comment.id };
  }

  async createRecruitmentComment(
    memberId: number,
    postId: number,
    dto: CreateRecruitmentCommentRequestDto,
  ): Promise<RecruitmentCommentResponseDto> {
    const exists = await this.commentRepository.existsRecruitmentPost(postId);
    if (!exists) {
      throw new NotFoundException('해당 모집글을 찾을 수 없습니다.');
    }

    const created = await this.commentRepository.createRecruitmentComment(
      memberId,
      postId,
      dto.content.trim(),
    );

    if (!created) {
      throw new NotFoundException('댓글 생성에 실패했습니다.');
    }

    const authorProfile = await this.commentRepository.findAuthorProfile(memberId);

    return {
      id: created.id,
      content: created.content,
      authorNickname: authorProfile?.nickname ?? null,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
