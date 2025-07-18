import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const countriesSlice = createApi({
  reducerPath: 'countriesSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['Countries'],
  endpoints: (builder) => ({
    getCountries: builder.query<any[], void>({
      query: () => '/countries',
      providesTags: ['Countries'],
    }),
    updateCountryStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/countries/${id}`,
        method: 'PUT',
        body: { isActive },
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Countries'],
    }),
  }),
});

export const { useGetCountriesQuery, useUpdateCountryStatusMutation } = countriesSlice; 