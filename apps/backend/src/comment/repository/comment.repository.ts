import { Inject, Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, asc, eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/common';
import { Comment } from '@/comment/domain';
import { Post } from '@/post/domain';
import { PostType } from '@homerunnie/shared';
import { PostStatusEnum } from '@/common/enums/post-status.enum';
import { Profile } from '@/member/domain/profile.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: ReturnType<typeof drizzle>,
  ) {}

  async findRecruitmentComments(postId: number) {
    return this.db
      .select({
        id: Comment.id,
        content: Comment.content,
        authorNickname: Profile.nickname,
        createdAt: Comment.createdAt,
      })
      .from(Comment)
      .leftJoin(Profile, eq(Profile.memberId, Comment.authorId))
      .where(and(eq(Comment.postId, postId), eq(Comment.deleted, false)))
      .orderBy(asc(Comment.createdAt));
  }

  async createRecruitmentComment(authorId: number, postId: number, content: string) {
    const [created] = await this.db
      .insert(Comment)
      .values({
        authorId,
        postId,
        content,
        postStatus: PostStatusEnum.ACTIVE,
      })
      .returning({
        id: Comment.id,
        content: Comment.content,
        createdAt: Comment.createdAt,
      });

    return created ?? null;
  }

  async findAuthorProfile(memberId: number) {
    const [profile] = await this.db
      .select({
        nickname: Profile.nickname,
      })
      .from(Profile)
      .where(and(eq(Profile.memberId, memberId), eq(Profile.deleted, false)));

    return profile ?? null;
  }

  async existsRecruitmentPost(postId: number) {
    const [post] = await this.db
      .select({ id: Post.id })
      .from(Post)
      .where(
        and(eq(Post.id, postId), eq(Post.post_type, PostType.RECRUITMENT), eq(Post.deleted, false)),
      );

    return Boolean(post);
  }
}
