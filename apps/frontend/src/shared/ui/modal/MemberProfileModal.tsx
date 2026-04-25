'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/primitives/dialog';
import { Team, TEAM_ASSETS, TeamDescription, DEFAULT_PROFILE_IMAGE } from '@homerunnie/shared';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  supportTeam: string | null;
}

const MemberProfileModal = ({
  isOpen,
  onClose,
  nickname,
  supportTeam,
}: MemberProfileModalProps) => {
  const teamImage =
    (supportTeam && TEAM_ASSETS[supportTeam as Team]?.image) || DEFAULT_PROFILE_IMAGE;
  const teamLabel = supportTeam ? (TeamDescription[supportTeam as Team] ?? supportTeam) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-bold">프로필</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none" />
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={teamImage}
              alt={nickname}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xl font-bold">{nickname}</p>
            {teamLabel && <p className="text-sm text-gray-500">{teamLabel} 응원</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProfileModal;
