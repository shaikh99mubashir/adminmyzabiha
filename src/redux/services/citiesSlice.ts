import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const citiesSlice = createApi({
  reducerPath: 'citiesSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['Cities'],
  endpoints: (builder) => ({
    getCities: builder.query<any[], void>({
      query: () => '/cities',
      providesTags: ['Cities'],
    }),
    updateCityStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/cities/${id}`,
        method: 'PUT',
        body: { isActive },
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Cities'],
    }),
  }),
});

export const { useGetCitiesQuery, useUpdateCityStatusMutation } = citiesSlice; 