import { Inject, Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Post, RecruitmentDetail } from '@/post/domain';
import { PostType } from '@homerunnie/shared';
import { PostStatusEnum } from '@/common/enums/post-status.enum';
import { TicketingType } from '@/common/enums/ticketing-type.enum';
import { PreferGender } from '@/common/enums/prefer-gender.enum';
import { Stadium } from '@/common/enums/stadium.enum';
import { Team } from '@/common/enums/team.enum';
import { Member } from '@/member/domain';
import { Profile } from '@/member/domain/profile.entity';
import { DATABASE_CONNECTION } from '@/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';

type RecruitmentPostSearchFilters = {
  keyword?: string;
  title?: string;
  gameDate?: string;
  stadium?: Stadium;
  teamA?: Team;
  teamB?: Team;
  headcount?: number;
  ticketingType?: TicketingType;
  favTeam?: Team;
  gender?: 'F' | 'M';
  preferGender?: PreferGender;
  picked?: string[];
  note?: string;
};

@Injectable()
export class PostRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: ReturnType<typeof drizzle>,
  ) {}

  async createRecruitmentPost(
    authorId: number,
    title: string,
    gameDate: Date,
    stadium: Stadium,
    teamHome: Team,
    teamAway: Team,
    recruitmentLimit: number,
    preferGender: PreferGender,
    message: string | null,
    ticketingType: TicketingType | null,
    supportTeam: Team | null,
    picked: string[] | null,
  ) {
    // Post 생성
    const [post] = await this.db
      .insert(Post)
      .values({
        title,
        post_type: PostType.RECRUITMENT,
        postStatus: PostStatusEnum.ACTIVE,
        authorId,
      })
      .returning();

    if (!post) {
      throw new Error('게시글 생성 실패');
    }

    // RecruitmentDetail 생성
    const [recruitmentDetail] = await this.db
      .insert(RecruitmentDetail)
      .values({
        postId: post.id,
        gameDate: gameDate.toISOString(),
        gameTime: gameDate.toISOString(), // gameTime도 gameDate와 동일하게 설정
        stadium: stadium.toString(),
        teamHome: teamHome.toString(),
        teamAway: teamAway.toString(),
        recruitmentLimit,
        preferGender,
        picked,
        message: message || null,
        ticketingType: ticketingType || null,
        supportTeam: supportTeam?.toString() || null,
      })
      .returning();

    return {
      post,
      recruitmentDetail,
    };
  }

  async findRecruitmentPosts(page: number, limit: number, filters?: RecruitmentPostSearchFilters) {
    const offset = (page - 1) * limit;
    const conditions = [eq(Post.post_type, PostType.RECRUITMENT), eq(Post.deleted, false)];
    const trimmedKeyword = filters?.keyword?.trim();
    const trimmedTitle = filters?.title?.trim();
    const trimmedNote = filters?.note?.trim();

    if (trimmedKeyword) {
      conditions.push(sql`LOWER(${Post.title}) LIKE ${`%${trimmedKeyword.toLowerCase()}%`}`);
    }
    if (trimmedTitle) {
      conditions.push(sql`LOWER(${Post.title}) LIKE ${`%${trimmedTitle.toLowerCase()}%`}`);
    }
    if (filters?.gameDate) {
      conditions.push(sql`DATE(${RecruitmentDetail.gameDate}) = DATE(${filters.gameDate})`);
    }
    if (filters?.stadium) {
      conditions.push(eq(RecruitmentDetail.stadium, filters.stadium));
    }
    if (filters?.teamA) {
      conditions.push(eq(RecruitmentDetail.teamHome, filters.teamA));
    }
    if (filters?.teamB) {
      conditions.push(eq(RecruitmentDetail.teamAway, filters.teamB));
    }
    if (typeof filters?.headcount === 'number' && Number.isFinite(filters.headcount)) {
      conditions.push(eq(RecruitmentDetail.recruitmentLimit, filters.headcount));
    }
    if (filters?.ticketingType) {
      conditions.push(eq(RecruitmentDetail.ticketingType, filters.ticketingType));
    }
    if (filters?.favTeam) {
      conditions.push(eq(RecruitmentDetail.supportTeam, filters.favTeam));
    }
    if (filters?.gender) {
      conditions.push(eq(Member.gender, filters.gender));
    }
    if (filters?.preferGender) {
      conditions.push(eq(RecruitmentDetail.preferGender, filters.preferGender));
    }
    if (trimmedNote) {
      conditions.push(
        sql`LOWER(COALESCE(${RecruitmentDetail.message}, '')) LIKE ${`%${trimmedNote.toLowerCase()}%`}`,
      );
    }
    if (filters?.picked?.length) {
      const pickedConditions = filters.picked.map(
        (value) => sql`${value} = ANY(${RecruitmentDetail.picked})`,
      );
      conditions.push(sql`(${sql.join(pickedConditions, sql` OR `)})`);
    }

    const data = await this.db
      .select({
        id: Post.id,
        title: Post.title,
        gameDate: sql<string>`TO_CHAR(${RecruitmentDetail.gameDate}, 'YYYY-MM-DD')`,
        teamHome: RecruitmentDetail.teamHome,
        teamAway: RecruitmentDetail.teamAway,
        postStatus: Post.postStatus,
        authorNickname: Profile.nickname,
        createdAt: Post.createdAt,
      })
      .from(Post)
      .innerJoin(RecruitmentDetail, eq(Post.id, RecruitmentDetail.postId))
      .leftJoin(Member, eq(Member.id, Post.authorId))
      .leftJoin(Profile, eq(Profile.memberId, Post.authorId))
      .where(and(...conditions))
      .orderBy(desc(Post.createdAt))
      .limit(limit)
      .offset(offset);

    return data;
  }

  async countRecruitmentPosts(filters?: RecruitmentPostSearchFilters): Promise<number> {
    const conditions = [eq(Post.post_type, PostType.RECRUITMENT), eq(Post.deleted, false)];
    const trimmedKeyword = filters?.keyword?.trim();
    const trimmedTitle = filters?.title?.trim();
    const trimmedNote = filters?.note?.trim();

    if (trimmedKeyword) {
      conditions.push(sql`LOWER(${Post.title}) LIKE ${`%${trimmedKeyword.toLowerCase()}%`}`);
    }
    if (trimmedTitle) {
      conditions.push(sql`LOWER(${Post.title}) LIKE ${`%${trimmedTitle.toLowerCase()}%`}`);
    }
    if (filters?.gameDate) {
      conditions.push(sql`DATE(${RecruitmentDetail.gameDate}) = DATE(${filters.gameDate})`);
    }
    if (filters?.stadium) {
      conditions.push(eq(RecruitmentDetail.stadium, filters.stadium));
    }
    if (filters?.teamA) {
      conditions.push(eq(RecruitmentDetail.teamHome, filters.teamA));
    }
    if (filters?.teamB) {
      conditions.push(eq(RecruitmentDetail.teamAway, filters.teamB));
    }
    if (typeof filters?.headcount === 'number' && Number.isFinite(filters.headcount)) {
      conditions.push(eq(RecruitmentDetail.recruitmentLimit, filters.headcount));
    }
    if (filters?.ticketingType) {
      conditions.push(eq(RecruitmentDetail.ticketingType, filters.ticketingType));
    }
    if (filters?.favTeam) {
      conditions.push(eq(RecruitmentDetail.supportTeam, filters.favTeam));
    }
    if (filters?.gender) {
      conditions.push(eq(Member.gender, filters.gender));
    }
    if (filters?.preferGender) {
      conditions.push(eq(RecruitmentDetail.preferGender, filters.preferGender));
    }
    if (trimmedNote) {
      conditions.push(
        sql`LOWER(COALESCE(${RecruitmentDetail.message}, '')) LIKE ${`%${trimmedNote.toLowerCase()}%`}`,
      );
    }
    if (filters?.picked?.length) {
      const pickedConditions = filters.picked.map(
        (value) => sql`${value} = ANY(${RecruitmentDetail.picked})`,
      );
      conditions.push(sql`(${sql.join(pickedConditions, sql` OR `)})`);
    }

    const result = await this.db
      .select({ count: count() })
      .from(Post)
      .innerJoin(RecruitmentDetail, eq(Post.id, RecruitmentDetail.postId))
      .leftJoin(Member, eq(Member.id, Post.authorId))
      .where(and(...conditions));

    return result[0]?.count || 0;
  }

  async findRecruitmentPostById(postId: number) {
    const [post] = await this.db
      .select({
        id: Post.id,
        authorId: Post.authorId,
        title: Post.title,
        postStatus: Post.postStatus,
        authorNickname: Profile.nickname,
        gameDate: RecruitmentDetail.gameDate,
        gameTime: RecruitmentDetail.gameTime,
        stadium: RecruitmentDetail.stadium,
        teamHome: RecruitmentDetail.teamHome,
        teamAway: RecruitmentDetail.teamAway,
        recruitmentLimit: RecruitmentDetail.recruitmentLimit,
        currentParticipants: RecruitmentDetail.currentParticipants,
        gender: Member.gender,
        preferGender: RecruitmentDetail.preferGender,
        picked: RecruitmentDetail.picked,
        message: RecruitmentDetail.message,
        ticketingType: RecruitmentDetail.ticketingType,
        supportTeam: RecruitmentDetail.supportTeam,
        createdAt: Post.createdAt,
      })
      .from(Post)
      .innerJoin(RecruitmentDetail, eq(Post.id, RecruitmentDetail.postId))
      .innerJoin(Member, eq(Post.authorId, Member.id))
      .leftJoin(Profile, eq(Profile.memberId, Member.id))
      .where(
        and(eq(Post.id, postId), eq(Post.post_type, PostType.RECRUITMENT), eq(Post.deleted, false)),
      );

    return post ?? null;
  }

  async softDeletePost(postId: number) {
    const [updated] = await this.db
      .update(Post)
      .set({ deleted: true })
      .where(and(eq(Post.id, postId), eq(Post.deleted, false)))
      .returning({ id: Post.id });

    return updated ?? null;
  }

  async updateRecruitmentPostStatus(
    postId: number,
    postStatus: PostStatusEnum.ACTIVE | PostStatusEnum.CLOSE,
  ) {
    const [updated] = await this.db
      .update(Post)
      .set({ postStatus, updatedAt: new Date() })
      .where(and(eq(Post.id, postId), eq(Post.post_type, PostType.RECRUITMENT)))
      .returning({
        id: Post.id,
        postStatus: Post.postStatus,
      });

    return updated ?? null;
  }
}
