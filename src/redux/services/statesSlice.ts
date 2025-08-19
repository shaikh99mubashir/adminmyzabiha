import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const statesSlice = createApi({
  reducerPath: 'statesSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['States'],
  endpoints: (builder) => ({
    getStates: builder.query<any[], void>({
      query: () => '/states',
      providesTags: ['States'],
    }),
    updateStateStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/states/${id}`,
        method: 'PUT',
        body: { isActive },
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['States'],
    }),
  }),
});

export const { useGetStatesQuery, useUpdateStateStatusMutation } = statesSlice; 