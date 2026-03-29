'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { JoinRequestResponse, Team, TEAM_ASSETS, DEFAULT_PROFILE_IMAGE } from '@homerunnie/shared';
import { getPendingJoinRequests, acceptJoinRequest, rejectJoinRequest } from '@/apis/chat/chat';

interface JoinRequestDropdownProps {
  roomId: string;
}

const getProfileImage = (supportTeam: string | null | undefined): string => {
  if (supportTeam && TEAM_ASSETS[supportTeam as Team]?.image) {
    return TEAM_ASSETS[supportTeam as Team]!.image;
  }
  return DEFAULT_PROFILE_IMAGE;
};

const JoinRequestDropdown = ({ roomId }: JoinRequestDropdownProps) => {
  const [requests, setRequests] = useState<JoinRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRequest, setHoveredRequest] = useState<JoinRequestResponse | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getPendingJoinRequests(Number(roomId));
        setRequests(data);
      } catch (error) {
        console.error('참여 요청 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [roomId]);

  const handleAccept = async (requestId: number) => {
    try {
      await acceptJoinRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setHoveredRequest(null);
    } catch (error) {
      console.error('수락 실패:', error);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectJoinRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setHoveredRequest(null);
    } catch (error) {
      console.error('거절 실패:', error);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 flex gap-2">
      {/* 프로필 카드 (호버 시) */}
      {hoveredRequest && (
        <div className="bg-white rounded-xl shadow-lg p-8 w-[250px] flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <Image
              src={getProfileImage(hoveredRequest.supportTeam)}
              alt={hoveredRequest.nickname}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xl font-semibold mb-4">{hoveredRequest.nickname}</p>
          <div className="text-b02-r text-gray-600 space-y-2 w-full">
            <div className="flex gap-4 justify-center">
              <span className="text-gray-500">성별</span>
              <span className="text-gray-900">{hoveredRequest.gender ?? '-'}</span>
            </div>
            <div className="flex gap-4 justify-center">
              <span className="text-gray-500">나이</span>
              <span className="text-gray-900">
                {hoveredRequest.birthDate ? `${hoveredRequest.birthDate.slice(2, 4)}년생` : '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 요청 목록 */}
      <div className="bg-white rounded-xl shadow-lg w-[300px] max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">로딩 중...</div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-400">참여 요청이 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                onMouseEnter={() => setHoveredRequest(request)}
                onMouseLeave={() => setHoveredRequest(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={getProfileImage(request.supportTeam)}
                      alt={request.nickname}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-b02-r text-gray-900">{request.nickname}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="text-b02-r text-green-600 hover:bg-gray-100 rounded px-2 py-1 transition-colors cursor-pointer"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="text-b02-r text-red-500 hover:bg-gray-100 rounded px-2 py-1 transition-colors cursor-pointer"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestDropdown;
