
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

interface ProductParams {
    page?: number
    limit?: number
    keyword?: string
    price?: string
}

export const productSlice = createApi({
    reducerPath: 'productSlice',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
    tagTypes: ['product'],
    endpoints: (builder) => ({

        getProducts: builder.query<any, ProductParams>({
            query: (params) => ({
                url: `/product`,
                method: "GET",
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 12,
                    keyword: params.keyword ?? "",
                    price: params.price ?? ""
                },
            }),
            transformResponse: (response: any) => response.data,
        }),

        getProductById: builder.query({
            query: ({ id }) => ({
                url: `/product/${id}`,
                method: "GET",
            }),
        }),


    }),
})

export const {
    useGetProductsQuery,
    useGetProductByIdQuery
} = productSlice
