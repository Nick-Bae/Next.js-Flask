import React from 'react';

interface BibleDisplayProps {
  passageText: string | null;
  loading: boolean;
  error: string | null;
}

const BibleDisplay: React.FC<BibleDisplayProps> = ({ passageText, loading, error }) => {
  if (loading) {
    return (
      <div className="mt-4 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      {passageText ? (
        <pre className="whitespace-pre-wrap text-gray-800">{passageText}</pre>
      ) : (
        <p className="text-gray-500">No passage fetched yet. Please select a version, book, and chapter to fetch the passage.</p>
      )}
    </div>
  );
};

export default BibleDisplay;
