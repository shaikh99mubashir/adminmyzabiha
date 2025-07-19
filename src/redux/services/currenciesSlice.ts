import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const currenciesSlice = createApi({
  reducerPath: 'currenciesSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['Currencies'],
  endpoints: (builder) => ({
    getCurrencies: builder.query<any[], void>({
      query: () => {
        console.log('Fetching currencies from:', '/currencies');
        return '/currencies';
      },
      providesTags: ['Currencies'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('Currencies API response:', result.data);
        } catch (error) {
          console.error('Failed to fetch currencies:', error);
        }
      },
    }),
    updateCurrencyStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => {
        console.log(`Making PUT request to /currencies/${id} with body:`, { isActive });
        return {
          url: `/currencies/${id}`,
          method: 'PUT',
          body: { isActive },
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['Currencies'],
      async onQueryStarted({ id, isActive }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(`Currency ${id} status updated to ${isActive}`);
        } catch (error) {
          console.error('Failed to update currency status:', error);
        }
      },
    }),
  }),
});

export const { useGetCurrenciesQuery, useUpdateCurrencyStatusMutation } = currenciesSlice; 