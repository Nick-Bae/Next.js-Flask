import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface BibleState {
  chapters: Record<string, string>;
  notes: Record<string, string>;
  loading: boolean;
  error: string | null;
}

const initialState: BibleState = {
  chapters: {},
  notes: {},
  loading: false,
  error: null,
};

export const fetchChapter = createAsyncThunk(
  'bible/fetchChapter',
  async ({ book, chapter }: { book: string; chapter: string }) => {
    const response = await fetch(`http://127.0.0.1:5000/api/search?book=${book}&chapter=${chapter}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chapter');
    }
    return response.text();
  }
);

export const fetchNotes = createAsyncThunk(
  'bible/fetchNotes',
  async (userId: string) => {
    const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}/notes`);
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    return response.json();
  }
);

const bibleSlice = createSlice({
  name: 'bible',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChapter.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters[action.meta.arg.chapter] = action.payload;
      })
      .addCase(fetchChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch chapter';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
      });
  },
});

export default bibleSlice.reducer;
