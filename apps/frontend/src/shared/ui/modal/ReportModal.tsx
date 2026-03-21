'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/primitives/dialog';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/primitives/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Label } from '@/shared/ui/primitives/label';
import Image from 'next/image';
import { createReport } from '@/apis/report/report';

export interface ReportParticipant {
  memberId: number;
  nickname: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: string[] | ReportParticipant[];
}

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'HARASSMENT', label: '욕설/비방' },
  { value: 'SPAM', label: '스팸/홍보성 메시지' },
  { value: 'FRAUD', label: '불법 정보' },
  { value: 'INAPPROPRIATE_CONTENT', label: '음란물/선정성' },
  { value: 'VIOLATION_OF_RULES', label: '규칙 위반' },
  { value: 'OTHER', label: '기타' },
];

const ReportModal = ({ isOpen, onClose, participants }: ReportModalProps) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isObjectParticipants = (p: string[] | ReportParticipant[]): p is ReportParticipant[] => {
    return p.length > 0 && typeof p[0] === 'object';
  };

  const handleSubmit = async () => {
    if (!selectedTarget || !reason) return;

    let reportedId: number;

    if (isObjectParticipants(participants)) {
      const target = participants.find((p) => String(p.memberId) === selectedTarget);
      if (!target) return;
      reportedId = target.memberId;
    } else {
      return;
    }

    setSubmitting(true);
    try {
      await createReport({ reportedId, reportType: reason, content: content || undefined });
      alert('신고가 접수되었습니다.');
      setSelectedTarget('');
      setReason('');
      setContent('');
      onClose();
    } catch {
      alert('신고 접수에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[670px] p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Image src="/icons/report.svg" alt="신고 아이콘" width={24} height={24} />
            신고하기
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"></DialogClose>
        </DialogHeader>

        <div className="grid gap-[8px]">
          <div className="pb-[36px]">
            <Label className="text-b01-r mb-[20px] block">대상</Label>
            <RadioGroup
              value={selectedTarget}
              onValueChange={setSelectedTarget}
              className="flex flex-wrap gap-x-6 gap-y-2"
            >
              {isObjectParticipants(participants)
                ? participants.map((p) => (
                    <div key={p.memberId} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(p.memberId)} id={`report-${p.memberId}`} />
                      <Label htmlFor={`report-${p.memberId}`} className="text-b01-r">
                        {p.nickname}
                      </Label>
                    </div>
                  ))
                : participants.map((name) => (
                    <div key={name} className="flex items-center space-x-2">
                      <RadioGroupItem value={name} id={name} />
                      <Label htmlFor={name} className="text-b01-r">
                        {name}
                      </Label>
                    </div>
                  ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="reason" className="text-b01-r mb-[20px] block">
              사유
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" className="w-[260px] text-b03-r text-muted-foreground">
                <SelectValue placeholder="신고 사유를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="신고 내용을 입력해주세요."
            className="min-h-[120px] mb-[44px] placeholder:text-gray-400"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Button
            type="button"
            size="lg"
            className="w-full bg-black text-white text-[18px] h-[70px] hover:bg-gray-800"
            disabled={!selectedTarget || !reason || submitting}
            onClick={handleSubmit}
          >
            {submitting ? '제출 중...' : '제출하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
