// /components/BibleChapter.tsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch, RootState } from '../../store/store';
import { fetchChapter } from '../../store/slices/bibleSlice';

interface BibleSearchProps {
  book: string;
  chapter: string;
}

const BibleSearch: React.FC<BibleSearchProps> = ({ book, chapter }) => {
  const dispatch = useAppDispatch();
  const { chapters, loading, error } = useSelector((state: RootState) => state.bible);

  useEffect(() => {
    dispatch(fetchChapter({ book, chapter }));
  }, [dispatch, book, chapter]);

  const chapterText = chapters[chapter]; // Access the chapter content here

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!chapterText) return <p>No content available for this chapter.</p>;

  return (
    <div>
      <h1>{`${book} ${chapter}`}</h1>
      <pre>{chapterText}</pre>
    </div>
  );
};

export default BibleSearch;