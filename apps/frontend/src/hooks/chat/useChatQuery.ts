'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyChatRooms, getChatRoomMembers } from '@/apis/chat/chat';

export const chatKeys = {
  rooms: ['chat-rooms'] as const,
  roomMembers: (roomId: number) => ['chat-room-members', roomId] as const,
};

export const useChatRoomsQuery = () => {
  return useQuery({
    queryKey: chatKeys.rooms,
    queryFn: () => getMyChatRooms(1, 20),
    retry: false,
  });
};

export const useChatRoomMembersQuery = (roomId: number, enabled = true) => {
  return useQuery({
    queryKey: chatKeys.roomMembers(roomId),
    queryFn: () => getChatRoomMembers(roomId),
    enabled: enabled && Number.isFinite(roomId) && roomId > 0,
  });
};
