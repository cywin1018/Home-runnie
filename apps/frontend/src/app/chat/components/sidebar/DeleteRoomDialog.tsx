'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/primitives/dialog';

interface DeleteRoomDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteRoomDialog = ({ open, onConfirm, onCancel }: DeleteRoomDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent showCloseButton={false} className="sm:max-w-[480px] p-10">
        <DialogHeader className="items-center">
          <DialogTitle className="text-xl font-bold text-center">
            채팅방을 삭제하시겠어요?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 mt-2">
            삭제하면 모든 대화 내용이 사라지고 되돌릴 수 없어요
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
            삭제하기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoomDialog;
