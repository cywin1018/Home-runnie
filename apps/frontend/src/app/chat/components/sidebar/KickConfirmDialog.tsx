'use client';

import { ChatRoomMemberResponse } from '@homerunnie/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/primitives/dialog';

interface KickConfirmDialogProps {
  targets: ChatRoomMemberResponse[];
  onConfirm: () => void;
  onCancel: () => void;
}

const KickConfirmDialog = ({ targets, onConfirm, onCancel }: KickConfirmDialogProps) => {
  return (
    <Dialog open={targets.length > 0} onOpenChange={onCancel}>
      <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-10">
        <DialogHeader className="items-center">
          <DialogTitle className="text-xl font-bold text-center">
            {targets.map((t) => t.nickname).join(', ')} 님을 내보내시겠어요?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 mt-2">
            내보내면 {targets.length === 1 ? `${targets[0].nickname}님은` : `${targets.length}명은`}{' '}
            더 이상 이 채팅방을 이용할 수 없어요
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-lg border border-gray-200 text-gray-900 text-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            내보내기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KickConfirmDialog;
