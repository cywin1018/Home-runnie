'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getRecruitmentComments,
  getRecruitmentPostDetail,
  getRecruitmentPosts,
} from '@/apis/post/post';

export const useRecruitmentPostsQuery = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['recruitment-posts', page, pageSize],
    queryFn: () => getRecruitmentPosts(page, pageSize),
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useRecruitmentPostDetailQuery = (postId: number) => {
  return useQuery({
    queryKey: ['recruitment-post-detail', postId],
    queryFn: () => getRecruitmentPostDetail(postId),
    enabled: Number.isFinite(postId) && postId > 0,
  });
};

export const useRecruitmentCommentsQuery = (postId: number) => {
  return useQuery({
    queryKey: ['recruitment-comments', postId],
    queryFn: () => getRecruitmentComments(postId),
    enabled: Number.isFinite(postId) && postId > 0,
  });
};
