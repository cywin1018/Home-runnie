import MyProfile from './components/MyProfile';
import MyContents from './components/MyContents';

export default function Page() {
  return (
    <div className="bg-gray-100 min-h-screen w-full flex flex-col items-center px-5 lg:px-40 pt-8 lg:pt-15 pb-10 lg:pb-20">
      <h1 className="text-t03-b lg:text-t01 font-bold w-full pb-8 lg:pb-15">마이페이지</h1>
      <MyProfile />
      <MyContents />
    </div>
  );
}
