import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const userSlice = createApi({
    reducerPath: 'userSlice',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + '/user', credentials: 'include' }),
    tagTypes: ['user'],
    endpoints: (builder) => ({
        getMe: builder.query<any, void>({
            query: () => `/profile`,
            transformResponse: (response: any) => response?.data?.user,
        }),
    }),
});

export const {
    useGetMeQuery
} = userSlice;
