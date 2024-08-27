// BibleSearch.tsx
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useAppDispatch, useAppSelector } from '../../../src/store/store';
import { fetchChapter, setBook, setChapter, setVersion }  from '../../../src/store/slices/bibleSlice';
import BibleDisplay from './BibleDisplay';
import { books } from '../constants/books';
import { koreanBookNames } from '../constants/koreanBookNames';

interface BibleSearchProps {
  initialBook: string;
  initialChapter: string;
  initialVersion: string;
  initialPassageText: string | null;
  initialError: string | null;
}

const BibleSearch: React.FC<BibleSearchProps> = ({ initialBook, initialChapter, initialVersion, initialPassageText, initialError }) => {
  const dispatch = useAppDispatch();
  const { passageText, loading, error, book, chapter, version } = useAppSelector((state) => state.bible);


  useEffect(() => {
    if (initialPassageText) {
      dispatch(fetchChapter({ book: initialBook, chapter: initialChapter, version: initialVersion }));
    }
  }, [dispatch, initialBook, initialChapter, initialVersion]);

  const handleFetchPassage = () => {
    // Ensure that for KRV version, the Korean book name is used
    const selectedBook = version === 'KRV' ? koreanBookNames[book] : book;
    dispatch(fetchChapter({ book: selectedBook, chapter, version }));
  };

  const displayedBooks = version === 'KRV' ? Object.values(koreanBookNames) : books;

  return (
    <div className="bibleDisplay">
      <div className="p-4 font-sans flex">
        <div className="mb-4">
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">Version</label>
          <select
            id="version"
            value={version}
            onChange={(e) => {
              const newVersion = e.target.value;
              dispatch(setVersion(newVersion));
              // Reset book selection based on version
              dispatch(setBook(newVersion === 'KRV' ? Object.keys(koreanBookNames)[0] : 'Genesis'));
            }}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {['ESV', 'ESV2', 'NIV','NLT', 'KRV'].map((ver) => (
              <option key={ver} value={ver}>
                {ver}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="book" className="block text-sm font-medium text-gray-700">Book</label>
          <select
            id="book"
            value={book}
            onChange={(e) => dispatch(setBook(e.target.value))}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {displayedBooks.map((bookName, index) => (
              <option key={bookName} value={version === 'KRV' ? Object.keys(koreanBookNames)[index] : bookName}>
                {bookName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="chapter" className="block text-sm font-medium text-gray-700">Chapter</label>
          <input
            id="chapter"
            type="text"
            placeholder="Enter chapter"
            value={chapter}
            onChange={(e) => dispatch(setChapter(e.target.value))}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleFetchPassage}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700"
        >
          Fetch Passage
        </button>
      </div>
      <BibleDisplay
        passageText={passageText}
        book={book}
        loading={loading}
        error={error}
        chapter={chapter}
        version={version}
      />
    </div>
  );
};

// Fetching the initial passage server-side
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { version = 'ESV', book = 'Genesis', chapter = '1' } = context.query;

  let initialPassageText = null;
  let initialError = null;

  try {
    let url: string;

    if (version === 'ESV') {
      url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(book as string)}%20${encodeURIComponent(chapter as string)}`;
    } else if (version === 'NLT') {
      url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(book as string)}%20${encodeURIComponent(chapter as string)}&version=${version}&key=${process.env.NEXT_PUBLIC_NLT_API_KEY}`;
    } else if (version === 'KRV') {
      // Ensure that for KRV version, the Korean book name is used
      const koreanBookName = koreanBookNames[book as string];
      url = `http://127.0.0.1:5000/api/search?book=${encodeURIComponent(koreanBookName)}&chapter=${encodeURIComponent(chapter as string)}&version=KRV`;
    } else {
      throw new Error('Unsupported Bible version.');
    }

    const response = await fetch(url, {
      headers: version === 'ESV' ? { Authorization: `Token ${process.env.NEXT_PUBLIC_ESV_API_KEY}` } : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch initial passage`);
    }

    const data = await response.json();
    initialPassageText = version === 'ESV' ? data.passages.join('\n') : data.map((item: { text: string }) => item.text).join('\n');
  } catch (error) {
    initialError = (error as Error).message || 'Error fetching initial passage';
  }

  return {
    props: {
      initialPassageText,
      initialError,
      initialBook: book,
      initialChapter: chapter,
      initialVersion: version,
    },
  };
};

export default BibleSearch;
