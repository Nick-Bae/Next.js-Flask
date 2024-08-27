// /store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'; // Ensure correct imports
import bibleReducer from './slices/bibleSlice';
import { notesApiSlice } from './slices/notesApiSlice'; // Example RTK Query slice

const rootReducer = combineReducers({
  bible: bibleReducer,
  [notesApiSlice.reducerPath]: notesApiSlice.reducer,
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(notesApiSlice.middleware),
  });
};

// Type definitions for RootState and AppDispatch
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ReturnType<typeof makeStore>['dispatch'];

// Typed hooks for usage in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
