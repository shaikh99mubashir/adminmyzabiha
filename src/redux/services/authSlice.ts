import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

interface LoginBody {
    email: string;
    password: string;
}

export const authSlice = createApi({
    reducerPath: 'authSlice',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (body: LoginBody) => ({
                url: "/auth/login",
                method: "POST",
                body,
            }),
            transformResponse: (response: any) => response.data,
        }),

        logout: builder.query({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
        }),
    }),
})

export const {
    useLoginMutation,
    useLogoutQuery,
} = authSlice
