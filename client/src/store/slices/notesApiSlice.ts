import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notesApiSlice = createApi({
  reducerPath: "notesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://127.0.0.1:5000/api/" }),
  endpoints: (builder) => ({
    fetchNotes: builder.query({
      query: ({ book, chapter }) => `notes?book=${book}&chapter=${chapter}`,
    }),
    fetchSermons: builder.query({
      query: ({ book, chapter }) => `sermons?book=${book}&chapter=${chapter}`,
    }),
  }),
});

export const { useFetchNotesQuery, useFetchSermonsQuery } = notesApiSlice;
