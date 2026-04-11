import Link from 'next/link';

export default function MateItem({
  id,
  match,
  gameDate,
  title,
  status,
  authorNickname,
  createdAt,
  isLast,
}: Readonly<{
  id: number;
  match: string;
  gameDate: string;
  title: string;
  status: '모집 중' | '모집 완료';
  authorNickname: string;
  createdAt: string;
  isLast: boolean;
}>) {
  const roundedClass = isLast ? 'rounded-b-2xl' : '';
  const statusClass =
    status === '모집 중' ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-blue-600';

  return (
    <Link
      href={`/home/${id}`}
      className={`block px-5 lg:px-10 py-4 lg:py-5 bg-white hover:bg-gray-50 transition-colors border-t border-gray-200 first:border-t-0 ${roundedClass}`}
    >
      <div className="grid grid-cols-[1fr_70px] lg:grid-cols-[220px_120px_1fr_120px_120px_120px] items-center gap-3 lg:gap-4 text-b03-m lg:text-b02-m">
        <p className="hidden lg:block truncate text-gray-800">{match}</p>
        <p className="hidden lg:block text-gray-800">{gameDate}</p>
        <p className="truncate text-gray-800">{title}</p>
        <div className="flex justify-center">
          <span
            className={`rounded-lg px-2 py-1 lg:px-3 lg:py-1.5 text-c01-m lg:text-b03-m whitespace-nowrap ${statusClass}`}
          >
            {status}
          </span>
        </div>
        <p className="hidden lg:block truncate text-right text-gray-500">{authorNickname}</p>
        <p className="hidden lg:block text-right text-gray-500">{createdAt}</p>
      </div>
    </Link>
  );
}
