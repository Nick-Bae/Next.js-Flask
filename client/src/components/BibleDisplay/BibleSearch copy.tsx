// BibleSearch.tsx
import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { books } from '../constants/books';
import { koreanBookNames } from '../constants/koreanBookNames';
import BibleDisplay from './BibleDisplay';

// Utility function to decode HTML entities
function decodeHtml(html: string) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

interface BibleSearchProps {
  initialPassageText: string | null;
  initialError: string | null;
  initialBook: string;
  initialChapter: string;
  initialVersion: string;
}

const BibleSearch: React.FC<BibleSearchProps> = ({ initialPassageText, initialError, initialBook, initialChapter, initialVersion }) => {
  const [book, setBook] = useState<string>(initialBook);
  const [chapter, setChapter] = useState<string>(initialChapter);
  const [version, setVersion] = useState<string>(initialVersion);
  const [passageText, setPassageText] = useState<string | null>(initialPassageText);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState<boolean>(false);

  const apiKeyEsv = process.env.NEXT_PUBLIC_ESV_API_KEY;
  const apiKeyNlt = process.env.NEXT_PUBLIC_NLT_API_KEY;

  const versions = ['ESV', 'NLT', 'KRV']; // Available versions including KRV

  // Get the list of books to display based on the selected version
  const displayedBooks = version === 'KRV' ? Object.values(koreanBookNames) : books;

  const fetchPassage = async () => {
    if (!chapter) {
      setError('Please enter a chapter number.');
      return;
    }

    setLoading(true);
    setError(null);
    setPassageText(null);

    const bookName = version === 'KRV' ? koreanBookNames[book] : book;
    const query = `${bookName} ${chapter}`;
    let url: string;

    // Determine URL based on selected version
    if (version === 'ESV') {
      url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(query)}`;
    } else if (version === 'NLT') {
      url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(query)}&version=${version}&key=${apiKeyNlt}`;
    } else if (version === 'KRV') {
      // Call your backend API for the KRV version
      url = `/api/krv?book=${encodeURIComponent(bookName)}&chapter=${encodeURIComponent(chapter)}`;
    } else {
      console.error('Unsupported version selected.');
      setPassageText('Unsupported version.');
      return;
    }

    try {
      // Fetch passage from the appropriate API
      const response = await fetch(url, {
        headers: version === 'ESV' ? { Authorization: `Token ${apiKeyEsv}` } : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Extract and set the text based on API response
      let text: string;
      if (version === 'NLT' || version === 'KRV') {
        const data = await response.json();
        text = data.map((item: { text: string }) => item.text).join('\n');
      } else {
        const data = await response.json();
        text = data.passages ? data.passages.join('\n') : 'No passage found.';
      }

      // Decode HTML entities if necessary
      setPassageText(decodeHtml(text));
    } catch (error) {
      console.error('Error fetching passage:', error);
      setPassageText('Error fetching passage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bibleDisplay">
      <div className="p-4 font-sans">
        {/* Form controls for selecting version, book, and chapter */}
        <div className="mb-4">
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">Version</label>
          <select
            id="version"
            value={version}
            onChange={(e) => {
              setVersion(e.target.value);
              setBook(e.target.value === 'KRV' ? Object.values(koreanBookNames)[0] : 'Genesis');
            }}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {versions.map((ver) => (
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
            onChange={(e) => setBook(e.target.value)}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {displayedBooks.map((bookName, index) => (
              <option key={bookName} value={version === 'KRV' ? Object.values(koreanBookNames)[index] : bookName}>
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
            onChange={(e) => setChapter(e.target.value)}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <button
          type="button"
          onClick={fetchPassage}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700"
        >
          Fetch Passage
        </button>
      </div>
      {/* Pass the fetched passageText to BibleDisplay */}
      <BibleDisplay 
        passageText={passageText} loading={loading} error={error} 
        version={version} book={book} chapter={chapter}
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
      url = `http://127.0.0.1:5000/api/search?book=${encodeURIComponent(book as string)}&chapter=${encodeURIComponent(chapter as string)}&version=KRV`;
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
  