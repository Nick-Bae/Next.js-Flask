import React from 'react';

interface BibleDisplayProps {
  passageText: string | null;
  loading: boolean;
  error: string | null;
  version: string;
  chapter: string;
  book: string;
}

const BibleDisplay: React.FC<BibleDisplayProps> = ({ passageText, loading, error, version,  book, chapter }) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

   // Function to render the ESV text
  const renderESVText = () => {
    return passageText?.split('\n').map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      const formattedLine = line.replace(/^(\s+)/, (match) => '\u00a0'.repeat(match.length));
      return <p key={index} className="mb-4">{formattedLine}</p>;
    });
  };

  // Function to render the KRV text with verse numbers
  const renderKRVText = () => {
    const verses = passageText?.split('\n').filter(line => line.trim() !== '');
    return verses?.map((verse, index) => (
      <p key={index} className="mb-4">
        <strong>[{index + 1}] </strong>{verse}
      </p>
    ));
  };
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Chapter {chapter}</h2>
        <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
          {version === 'KRV' ? renderKRVText() : renderESVText()}
        </div>
      </div>
    </div>
  );
};

export default BibleDisplay;
