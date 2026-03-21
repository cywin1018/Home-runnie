'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { JoinRequestResponse } from '@homerunnie/shared';
import { getPendingJoinRequests, acceptJoinRequest, rejectJoinRequest } from '@/apis/chat/chat';

interface JoinRequestDropdownProps {
  roomId: string;
}

const JoinRequestDropdown = ({ roomId }: JoinRequestDropdownProps) => {
  const [requests, setRequests] = useState<JoinRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequestResponse | null>(null);

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
      setSelectedRequest(null);
    } catch (error) {
      console.error('수락 실패:', error);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await rejectJoinRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setSelectedRequest(null);
    } catch (error) {
      console.error('거절 실패:', error);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 flex gap-2">
      {/* 프로필 카드 (선택 시) */}
      {selectedRequest && (
        <div className="bg-white rounded-xl shadow-lg p-8 w-[250px] flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-pink-500" />
          </div>
          <p className="text-xl font-semibold mb-4">{selectedRequest.nickname}</p>
          <div className="text-b02-r text-gray-600 space-y-2 w-full">
            <div className="flex gap-4 justify-center">
              <span className="text-gray-500">성별</span>
              <span className="text-gray-900">{selectedRequest.gender ?? '-'}</span>
            </div>
            <div className="flex gap-4 justify-center">
              <span className="text-gray-500">나이</span>
              <span className="text-gray-900">
                {selectedRequest.birthDate ? `${selectedRequest.birthDate.slice(2, 4)}년생` : '-'}
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
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRequest?.id === request.id ? 'bg-gray-50' : ''
                }`}
                onClick={() =>
                  setSelectedRequest(selectedRequest?.id === request.id ? null : request)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-pink-500" />
                  </div>
                  <span className="text-b02-r text-gray-900">{request.nickname}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(request.id);
                    }}
                    className="text-b02-r text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                  >
                    수락
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(request.id);
                    }}
                    className="text-b02-r text-red-500 hover:text-red-600 transition-colors cursor-pointer"
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
