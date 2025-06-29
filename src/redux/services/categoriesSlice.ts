import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

interface CategoryBody {
    name: string;
    description?: string;
    image?: File;
    parent?: string;
    price?: string;
    unit?: string;
    numberOfUnits?: string;
    keywords?: string;
    shortDescription?: string;
    numberOfPieces?: string;
    mrpPrice?: string;
    offPercent?: string;
}

export const categoriesSlice = createApi({
    reducerPath: 'categoriesSlice',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
    tagTypes: ['Categories'],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: (_?: any) => "/categories",
            providesTags: ['Categories'],
        }),

        createCategory: builder.mutation({
            query: (body: CategoryBody) => {
                const formData = new FormData();
                Object.keys(body).forEach(key => {
                    const value = body[key as keyof CategoryBody];
                    if (value !== undefined && value !== null && value !== '') {
                        formData.append(key, value);
                    }
                });
                
                return {
                    url: "/categories",
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ['Categories'],
        }),

        deleteCategory: builder.mutation({
            query: (id: string) => ({
                url: `/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Categories'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
} = categoriesSlice; 