import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50 mt-16">
      <div className="max-w-[1440px] mx-auto px-[120px] py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-b02-sb text-gray-900">Homerunnie</p>
            <p className="text-b03-r text-gray-600">직관 메이트를 찾고 함께 응원하는 커뮤니티</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="text-b03-sb text-gray-800">서비스</p>
              <Link href="/home" className="text-b03-r text-gray-600 hover:text-gray-900">
                홈
              </Link>
              <Link href="/write" className="text-b03-r text-gray-600 hover:text-gray-900">
                모집글 작성
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-b03-sb text-gray-800">커뮤니티</p>
              <Link href="/chat" className="text-b03-r text-gray-600 hover:text-gray-900">
                채팅
              </Link>
              <Link href="/my" className="text-b03-r text-gray-600 hover:text-gray-900">
                마이페이지
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-b03-sb text-gray-800">정책</p>
              <Link href="/home" className="text-b03-r text-gray-600 hover:text-gray-900">
                이용약관
              </Link>
              <Link href="/home" className="text-b03-r text-gray-600 hover:text-gray-900">
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <p className="text-c01-r text-gray-500">© 2026 Homerunnie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
