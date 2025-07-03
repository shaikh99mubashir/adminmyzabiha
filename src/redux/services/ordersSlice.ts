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
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: '/orders',
                method: 'POST',
                body: orderData,
            }),
            invalidatesTags: ['Orders'],
        }),
        updateOrder: builder.mutation({
            query: ({ id, orderData }) => ({
                url: `/orders/${id}`,
                method: 'PUT',
                body: orderData,
            }),
            invalidatesTags: ['Orders'],
        }),
        getOrderById: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: ['Orders'],
        }),
    }),
});

export const {
    useGetOrdersQuery,
    useCreateOrderMutation,
    useUpdateOrderMutation,
    useGetOrderByIdQuery,
} = ordersSlice; 