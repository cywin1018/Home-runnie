'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const hasMessage = message.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm"
    >
      <input
        type="text"
        value={message}
        onChange={handleChange}
        placeholder="하고싶은 말을 적어보세요"
        className="grow bg-transparent focus:outline-none px-2"
      />
      <button
        type="submit"
        disabled={!hasMessage}
        className={`shrink-0 rounded-md px-6 py-2 text-b03-r transition-colors ${
          hasMessage
            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
            : 'bg-gray-200 text-gray-600 cursor-not-allowed'
        }`}
      >
        전송
      </button>
    </form>
  );
};

export default ChatInput;
