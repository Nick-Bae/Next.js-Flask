// /store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import bibleReducer from './slices/bibleSlice';

export const store = configureStore({
  reducer: {
    bible: bibleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export a typed version of the useDispatch hook
export const useAppDispatch: () => AppDispatch = useDispatch;
