import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '@/post/repository';
import {
  CreateRecruitmentPostRequestDto,
  CreateRecruitmentPostResponseDto,
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
    page: number = 1,
    limit: number = 10,
  ): Promise<GetRecruitmentPostsResponseDto> {
    const [posts, total] = await Promise.all([
      this.postRepository.findRecruitmentPosts(page, limit),
      this.postRepository.countRecruitmentPosts(),
    ]);

    const data = posts.map(
      (post) =>
        new RecruitmentPostItemResponseDto({
          id: post.id,
          title: post.title,
          gameDate: post.gameDate,
          teamHome: post.teamHome,
          teamAway: post.teamAway,
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
