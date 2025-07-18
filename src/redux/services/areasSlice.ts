import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const areasSlice = createApi({
  reducerPath: 'areasSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['Areas'],
  endpoints: (builder) => ({
    getAreas: builder.query<any[], void>({
      query: () => '/areas',
      providesTags: ['Areas'],
    }),
    updateAreaStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/areas/${id}`,
        method: 'PUT',
        body: { isActive },
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Areas'],
    }),
  }),
});

export const { useGetAreasQuery, useUpdateAreaStatusMutation } = areasSlice; 