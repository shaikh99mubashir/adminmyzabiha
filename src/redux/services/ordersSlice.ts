import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const ordersSlice = createApi({
    reducerPath: 'ordersSlice',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
    tagTypes: ['Orders'],
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: (_?: any) => "/orders",
            providesTags: ['Orders'],
        }),
    }),
});

export const {
    useGetOrdersQuery,
} = ordersSlice; 