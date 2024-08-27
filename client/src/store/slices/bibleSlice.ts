// /store/slices/bibleSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface BibleState {
  passageText: string | null;
  loading: boolean;
  error: string | null;
  book: string;
  chapter: string;
  version: string;
}

const initialState: BibleState = {
  passageText: null,
  loading: false,
  error: null,
  book: 'Genesis',
  chapter: '1',
  version: 'ESV',
};

export const fetchChapter = createAsyncThunk(
  'bible/fetchChapter',
  async ({ book, chapter, version }: { book: string; chapter: string; version: string }) => {
    let url: string;
    if (version === 'ESV') {
      url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(book)}%20${encodeURIComponent(chapter)}`;
    } else if (version === 'NLT') {
      url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(book)}%20${encodeURIComponent(chapter)}&version=${version}&key=${process.env.NEXT_PUBLIC_NLT_API_KEY}`;
    } else if (version === 'KRV') {
      url = `http://127.0.0.1:5000/api/search?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&version=KRV`;
    } else if (version === 'NIV') {
      url = `http://127.0.0.1:5000/api/search?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&version=NIV`;
    } else if (version === 'ESV2') {
      url = `http://127.0.0.1:5000/api/search?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&version=ESV2`;
    } else {
      throw new Error('Unsupported Bible version.');
    }

    const response = await fetch(url, {
      headers: version === 'ESV' ? { Authorization: `Token ${process.env.NEXT_PUBLIC_ESV_API_KEY}` } : undefined,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch passage`);
    }

    const data = await response.json();

    // For KRV, manually add verse numbers
    if (version === 'KRV') {
      return data
        .map((item: { text: string }, index: number) => {
          const text = item.text.trim();

          // Check if the text contains a title pattern like <천지 창조>
          if (text.startsWith('<') && text.includes('>')) {
            const [title, verse] = text.split('> ');
            const formattedTitle = `${title}>`;  // Keep the title intact
            const formattedVerse = verse ? `${index + 1}. ${verse}` : '';

            // Return title on its own line followed by the verse
            return `${formattedTitle}\n${formattedVerse}`;
          } else {
            // For regular verses without a title
            return `${index + 1}. ${text}`;
          }
        })
        .join('\n');
    }

    // For ESV and other versions, return as is
    return version === 'ESV' ? data.passages.join('\n') : data.map((item: { text: string }) => item.text).join('\n');
  }
);

const bibleSlice = createSlice({
  name: 'bible',
  initialState,
  reducers: {
    setBook(state, action: PayloadAction<string>) {
      state.book = action.payload;
    },
    setChapter(state, action: PayloadAction<string>) {
      state.chapter = action.payload;
    },
    setVersion(state, action: PayloadAction<string>) {
      state.version = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapter.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.passageText = action.payload;
      })
      .addCase(fetchChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch chapter';
      });
  },
});

export const {
 
  setBook,
  setChapter,
  setVersion,
} = bibleSlice.actions;

export default bibleSlice.reducer;
