import type { Metadata } from 'next';
import Providers from './providers';
import '@/shared/styles/index.css';
import 'sonner/dist/styles.css';
import Header from '@/shared/ui/header/header';
import Footer from '@/shared/ui/footer/footer';
import '@/mocks'; // MSW 초기화 (브라우저 환경에서만 동작)

export const metadata: Metadata = {
  title: 'Homerunnie',
  description: '직관 메이트를 찾고 함께 응원하는 커뮤니티',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="max-w-[1440px] mx-auto w-full flex-1 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[120px]">
              <main>{children}</main>
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
