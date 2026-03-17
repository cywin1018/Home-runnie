import MainBanner from './components/MainBanner';
import MateListBanner from './components/MateListBanner';

export default function Page() {
  return (
    <div className="w-full flex flex-col">
      <MainBanner />
      <MateListBanner />
    </div>
  );
}
