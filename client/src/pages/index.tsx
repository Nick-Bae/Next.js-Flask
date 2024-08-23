// /pages/index.tsx
import type { NextPage } from 'next';
import BibleSearch from '../components/BibleDisplay/BibleSearch';
import BibleDisplay from 'src/components/BibleDisplay/BibleDisplay';

const Home: NextPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <BibleDisplay />
      {/* <BibleSearch book="창세기" chapter="1" /> */}
    </div>
  );
};

export default Home;
