import { CreateRecruitmentPostRequest, CreateRecruitmentPostResponse } from '@homerunnie/shared';
import { apiClient } from '@/lib/fetchClient';

export interface RecruitmentPostItemResponse {
  id: number;
  title: string;
  gameDate: string;
  teamHome: string;
  teamAway: string;
  createdAt: string;
}

export interface GetRecruitmentPostsResponse {
  data: RecruitmentPostItemResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateRecruitmentPostStatusRequest {
  postStatus: 'ACTIVE' | 'CLOSE';
}

export interface UpdateRecruitmentPostStatusResponse {
  id: number;
  postStatus: 'ACTIVE' | 'CLOSE';
}

export interface RecruitmentCommentResponse {
  id: number;
  content: string;
  authorNickname: string | null;
  createdAt: string;
}

export interface CreateRecruitmentCommentRequest {
  content: string;
}

interface GetRecruitmentPostDetailApiResponse {
  id: number;
  title: string;
  authorId: number;
  authorNickname: string | null;
  postStatus: string;
  gameDate: string;
  gameTime: string;
  stadium: string;
  teamHome: string;
  teamAway: string;
  recruitmentLimit: number;
  currentParticipants: number;
  gender: string | null;
  preferGender: string;
  picked: string[] | null;
  message: string | null;
  ticketingType: string | null;
  supportTeam: string | null;
  createdAt: string;
}

type WriteSchemaSnapshot = Pick<
  CreateRecruitmentPostRequest,
  'teamA' | 'teamB' | 'headcount' | 'ticketStatus' | 'favTeam' | 'prefGender' | 'note'
>;

export interface GetRecruitmentPostDetailResponse
  extends GetRecruitmentPostDetailApiResponse, WriteSchemaSnapshot {}

export const createRecruitmentPost = async (
  data: CreateRecruitmentPostRequest,
): Promise<CreateRecruitmentPostResponse> => {
  return apiClient.post<CreateRecruitmentPostResponse>('/post/recruitment', data, {
    authRequired: true,
  });
};

export const getRecruitmentPosts = async (
  page: number = 1,
  pageSize: number = 10,
): Promise<GetRecruitmentPostsResponse> => {
  return apiClient.get<GetRecruitmentPostsResponse>(
    `/post/recruitment?page=${page}&pageSize=${pageSize}`,
  );
};

export const getRecruitmentPostDetail = async (
  postId: number,
): Promise<GetRecruitmentPostDetailResponse> => {
  const raw = await apiClient.get<GetRecruitmentPostDetailApiResponse>(
    `/post/recruitment/${postId}`,
  );

  const prefGenderMap: Record<string, CreateRecruitmentPostRequest['prefGender']> = {
    FEMALE: 'F',
    MALE: 'M',
    ANY: 'ANY',
    F: 'F',
    M: 'M',
  };

  const ticketStatusMap: Record<string, CreateRecruitmentPostRequest['ticketStatus']> = {
    SEPARATE: 'have',
    TOGETHER: 'need',
  };

  return {
    ...raw,
    teamA: raw.teamHome as CreateRecruitmentPostRequest['teamA'],
    teamB: raw.teamAway as CreateRecruitmentPostRequest['teamB'],
    headcount: String(raw.recruitmentLimit),
    ticketStatus: ticketStatusMap[raw.ticketingType ?? ''] ?? 'need',
    favTeam: (raw.supportTeam ?? undefined) as CreateRecruitmentPostRequest['favTeam'],
    gender: raw.gender,
    prefGender: prefGenderMap[raw.preferGender] ?? 'ANY',
    picked: raw.picked,
    note: raw.message ?? undefined,
  };
};

export const updateRecruitmentPostStatus = async (
  postId: number,
  data: UpdateRecruitmentPostStatusRequest,
): Promise<UpdateRecruitmentPostStatusResponse> => {
  return apiClient.patch<UpdateRecruitmentPostStatusResponse>(
    `/post/recruitment/${postId}/status`,
    data,
    {
      authRequired: true,
    },
  );
};

export const getRecruitmentComments = async (
  postId: number,
): Promise<RecruitmentCommentResponse[]> => {
  return apiClient.get<RecruitmentCommentResponse[]>(`/post/recruitment/${postId}/comments`);
};

export const createRecruitmentComment = async (
  postId: number,
  data: CreateRecruitmentCommentRequest,
): Promise<RecruitmentCommentResponse> => {
  return apiClient.post<RecruitmentCommentResponse>(`/post/recruitment/${postId}/comments`, data, {
    authRequired: true,
  });
};
