import { useState } from 'react';
import { books } from '../constants/books';
import { koreanBookNames } from '../constants/koreanBookNames';

// Utility function to decode HTML entities
function decodeHtml(html: string) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

const BibleDisplay = () => {
  const [book, setBook] = useState<string>('Genesis');
  const [chapter, setChapter] = useState<string>('');
  const [version, setVersion] = useState<string>('ESV'); // Default version
  const [passageText, setPassageText] = useState<string | null>(null);

  const apiKeyEsv = process.env.NEXT_PUBLIC_ESV_API_KEY;  
  const apiKeyNLT = process.env.NEXT_PUBLIC_ESV_API_KEY;  

  const versions = ['ESV', 'NLT', 'KRV']; // Available versions including KRV

  // Get the list of books to display based on the selected version
  const displayedBooks = version === 'KRV' ? Object.values(koreanBookNames) : books;

  const fetchPassage = async () => {
    // Use the Korean book name if the selected version is KRV
    const bookName = version === 'KRV' ? koreanBookNames[book] : book;
    const query = `${bookName} ${chapter}`;
    let url: string;

    // Determine URL based on selected version
    if (version === 'ESV') {
      url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(query)}`;
    } else if (version === 'NLT') {
      url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(query)}&version=${version}&key=${apiKeyNLT}`;
    } else if (version === 'KRV') {
      // Call your backend API for the KRV version
      url = `http://127.0.0.1:5000/api/search?book=${encodeURIComponent(bookName)}&chapter=${encodeURIComponent(chapter)}&version=KRV`;
    } else {
      console.error('Unsupported version selected.');
      setPassageText('Unsupported version.');
      return;
    }

    try {
      // Fetch passage from the appropriate API
      const response = await fetch(url, {
        headers: version === 'ESV' ? { 'Authorization': `Token ${apiKeyEsv}` } : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Extract and set the text based on API response
      let text: string;
      if (version === 'NLT' || version === 'KRV') {
        // For NLT and KRV, assuming the API returns JSON with text fields
        const data = await response.json();
        text = data.map((item: { text: string }) => item.text).join('\n');
      } else {
        const data = await response.json();
        // Extract text from JSON for ESV API
        text = data.passages ? data.passages.join('\n') : 'No passage found.';
      }

      // Decode HTML entities if necessary
      setPassageText(decodeHtml(text));
    } catch (error) {
      console.error('Error fetching passage:', error);
      setPassageText('Error fetching passage.');
    }
  };

  return (
    <div className="p-4 font-sans">
      <div className="mb-4">
        <label htmlFor="version" className="block text-sm font-medium text-gray-700">Version</label>
        <select
          id="version"
          value={version}
          onChange={(e) => {
            setVersion(e.target.value);
            // Reset the book selection when the version changes
            setBook(e.target.value === 'KRV' ? Object.keys(koreanBookNames)[0] : 'Genesis');
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

      <div className="mt-4">
        {passageText ? (
          <pre className="whitespace-pre-wrap">{passageText}</pre>
        ) : (
          <p className="text-gray-500">No passage fetched yet.</p>
        )}
      </div>
    </div>
  );
};

export default BibleDisplay;
