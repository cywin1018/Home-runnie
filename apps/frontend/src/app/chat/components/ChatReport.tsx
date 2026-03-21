'use client';

import ReportModal, { ReportParticipant } from '@/shared/ui/modal/ReportModal';

interface ChatReportProps {
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  participants: ReportParticipant[];
}

const ChatReport = ({ isModalOpen, onCloseModal, participants }: ChatReportProps) => {
  return <ReportModal isOpen={isModalOpen} onClose={onCloseModal} participants={participants} />;
};
export default ChatReport;
