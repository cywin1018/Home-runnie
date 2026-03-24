import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '@/post/repository';
import {
  CreateRecruitmentPostRequestDto,
  CreateRecruitmentPostResponseDto,
  GetRecruitmentPostsQueryDto,
  GetRecruitmentPostDetailResponseDto,
  GetRecruitmentPostsResponseDto,
  RecruitmentPostItemResponseDto,
  UpdateRecruitmentPostStatusRequestDto,
  UpdateRecruitmentPostStatusResponseDto,
} from '@/post/dto';
import { PostStatusEnum } from '@/common/enums/post-status.enum';
import { TicketingType } from '@/common/enums/ticketing-type.enum';
import { PreferGender } from '@/common/enums/prefer-gender.enum';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createRecruitmentPost(
    authorId: number,
    dto: CreateRecruitmentPostRequestDto,
  ): Promise<CreateRecruitmentPostResponseDto> {
    const {
      title,
      gameDate,
      stadium,
      teamA,
      teamB,
      headcount,
      ticketStatus,
      favTeam,
      prefGender,
      picked,
      note,
    } = dto;

    let ticketingType: TicketingType | null = null;
    if (ticketStatus === 'have') {
      ticketingType = TicketingType.SEPARATE;
    } else if (ticketStatus === 'need') {
      ticketingType = TicketingType.TOGETHER;
    }

    let preferGenderEnum: PreferGender;
    if (prefGender === 'F') {
      preferGenderEnum = PreferGender.FEMALE;
    } else if (prefGender === 'M') {
      preferGenderEnum = PreferGender.MALE;
    } else {
      preferGenderEnum = PreferGender.ANY;
    }

    const result = await this.postRepository.createRecruitmentPost(
      authorId,
      title,
      new Date(gameDate),
      stadium,
      teamA,
      teamB,
      parseInt(headcount, 10),
      preferGenderEnum,
      note || null,
      ticketingType,
      favTeam || null,
      picked ?? null,
    );

    return {
      id: result.post.id,
      title: result.post.title,
      createdAt: result.post.createdAt,
    };
  }

  async getRecruitmentPosts(
    query: GetRecruitmentPostsQueryDto,
  ): Promise<GetRecruitmentPostsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.pageSize ?? 10;
    const ticketingType =
      query.ticketStatus === 'have'
        ? TicketingType.SEPARATE
        : query.ticketStatus === 'need'
          ? TicketingType.TOGETHER
          : undefined;
    const preferGender =
      query.prefGender === 'F'
        ? PreferGender.FEMALE
        : query.prefGender === 'M'
          ? PreferGender.MALE
          : query.prefGender === 'ANY'
            ? PreferGender.ANY
            : undefined;

    const [posts, total] = await Promise.all([
      this.postRepository.findRecruitmentPosts(page, limit, {
        keyword: query.keyword,
        title: query.title,
        gameDate: query.gameDate,
        stadium: query.stadium,
        teamA: query.teamA,
        teamB: query.teamB,
        headcount: query.headcount ? Number.parseInt(query.headcount, 10) : undefined,
        ticketingType,
        favTeam: query.favTeam,
        gender: query.gender,
        preferGender,
        picked: query.picked,
        note: query.note,
      }),
      this.postRepository.countRecruitmentPosts({
        keyword: query.keyword,
        title: query.title,
        gameDate: query.gameDate,
        stadium: query.stadium,
        teamA: query.teamA,
        teamB: query.teamB,
        headcount: query.headcount ? Number.parseInt(query.headcount, 10) : undefined,
        ticketingType,
        favTeam: query.favTeam,
        gender: query.gender,
        preferGender,
        picked: query.picked,
        note: query.note,
      }),
    ]);

    const data = posts.map(
      (post) =>
        new RecruitmentPostItemResponseDto({
          id: post.id,
          title: post.title,
          gameDate: post.gameDate,
          teamHome: post.teamHome,
          teamAway: post.teamAway,
          postStatus: post.postStatus,
          authorNickname: post.authorNickname,
          createdAt: post.createdAt.toISOString(),
        }),
    );

    return new GetRecruitmentPostsResponseDto(data, total, page, limit);
  }

  async getRecruitmentPostDetail(postId: number): Promise<GetRecruitmentPostDetailResponseDto> {
    const post = await this.postRepository.findRecruitmentPostById(postId);
    if (!post) {
      throw new NotFoundException('해당 모집글을 찾을 수 없습니다.');
    }

    const response = new GetRecruitmentPostDetailResponseDto();
    response.id = post.id;
    response.title = post.title;
    response.authorNickname = post.authorNickname;
    response.authorId = post.authorId;
    response.postStatus = post.postStatus;
    response.gameDate = post.gameDate;
    response.gameTime = post.gameTime;
    response.stadium = post.stadium;
    response.teamHome = post.teamHome;
    response.teamAway = post.teamAway;
    response.recruitmentLimit = post.recruitmentLimit;
    response.currentParticipants = post.currentParticipants;
    response.gender = post.gender;
    response.preferGender = post.preferGender;
    response.picked = post.picked;
    response.message = post.message;
    response.ticketingType = post.ticketingType;
    response.supportTeam = post.supportTeam;
    response.createdAt = post.createdAt.toISOString();

    return response;
  }

  async deleteRecruitmentPost(memberId: number, postId: number) {
    const post = await this.postRepository.findRecruitmentPostById(postId);
    if (!post) {
      throw new NotFoundException('해당 모집글을 찾을 수 없습니다.');
    }
    if (post.authorId !== memberId) {
      throw new ForbiddenException('작성자만 삭제할 수 있습니다.');
    }

    const deleted = await this.postRepository.softDeletePost(postId);
    if (!deleted) {
      throw new NotFoundException('해당 모집글을 찾을 수 없습니다.');
    }

    return { id: deleted.id };
  }

  async updateRecruitmentPostStatus(
    memberId: number,
    postId: number,
    dto: UpdateRecruitmentPostStatusRequestDto,
  ): Promise<UpdateRecruitmentPostStatusResponseDto> {
    const post = await this.postRepository.findRecruitmentPostById(postId);
    if (!post) {
      throw new NotFoundException('해당 모집글을 찾을 수 없습니다.');
    }
    if (post.authorId !== memberId) {
      throw new ForbiddenException('작성자만 모집 상태를 변경할 수 있습니다.');
    }

    const updated = await this.postRepository.updateRecruitmentPostStatus(
      postId,
      dto.postStatus as PostStatusEnum.ACTIVE | PostStatusEnum.CLOSE,
    );
    if (!updated) {
      throw new NotFoundException('해당 모집글을 찾을 수 없습니다.');
    }

    return {
      id: updated.id,
      postStatus: updated.postStatus as PostStatusEnum.ACTIVE | PostStatusEnum.CLOSE,
    };
  }
}
