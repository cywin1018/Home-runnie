import ChatBox from '../components/chat-box/ChatBox';

interface ChatRoomPageProps {
  params: {
    id: string;
  };
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  return (
    <section className="flex flex-col w-full h-full">
      <ChatBox roomId={params.id} />
    </section>
  );
}
