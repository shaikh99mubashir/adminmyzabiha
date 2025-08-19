import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const qurbaniTypesSlice = createApi({
  reducerPath: 'qurbaniTypesSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['QurbaniTypes'],
  endpoints: (builder) => ({
    getQurbaniTypes: builder.query<any[], void>({
      query: () => {
        console.log('Fetching qurbani animal types from:', '/v1/qurbani-types');
        return '/qurbani-types';
      },
      providesTags: ['QurbaniTypes'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('Qurbani Animal Types API response:', result.data);
        } catch (error) {
          console.error('Failed to fetch qurbani animal types:', error);
        }
      },
    }),
    createQurbaniType: builder.mutation<any, { name: string; isActive: boolean }>({
      query: (qurbaniTypeData) => {
        console.log('Making POST request to /v1/qurbani-types with body:', qurbaniTypeData);
        return {
          url: '/qurbani-types',
          method: 'POST',
          body: qurbaniTypeData,
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniTypes'],
      async onQueryStarted(qurbaniTypeData, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log('Qurbani Animal Type created successfully:', qurbaniTypeData);
        } catch (error) {
          console.error('Failed to create qurbani animal type:', error);
        }
      },
    }),
    updateQurbaniType: builder.mutation<any, { id: string; name: string; isActive: boolean }>({
      query: ({ id, ...qurbaniTypeData }) => {
        console.log(`Making PUT request to /v1/qurbani-types/${id} with body:`, qurbaniTypeData);
        return {
          url: `/qurbani-types/${id}`,
          method: 'PUT',
          body: qurbaniTypeData,
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniTypes'],
      async onQueryStarted({ id, ...qurbaniTypeData }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(`Qurbani Animal Type ${id} updated successfully:`, qurbaniTypeData);
        } catch (error) {
          console.error('Failed to update qurbani animal type:', error);
        }
      },
    }),
    deleteQurbaniType: builder.mutation<any, { id: string }>({
      query: ({ id }) => {
        console.log(`Making DELETE request to /v1/qurbani-types/${id}`);
        return {
          url: `/qurbani-types/${id}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniTypes'],
      async onQueryStarted({ id }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(`Qurbani Animal Type ${id} deleted successfully`);
        } catch (error) {
          console.error('Failed to delete qurbani animal type:', error);
        }
      },
    }),
    updateQurbaniTypeStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => {
        console.log(`Making PUT request to /v1/qurbani-types/${id} with body:`, { isActive });
        return {
          url: `/qurbani-types/${id}`,
          method: 'PUT',
          body: { isActive },
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniTypes'],
      async onQueryStarted({ id, isActive }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(`Qurbani Animal Type ${id} status updated to ${isActive}`);
        } catch (error) {
          console.error('Failed to update qurbani animal type status:', error);
        }
      },
    }),
  }),
});

export const { 
  useGetQurbaniTypesQuery, 
  useCreateQurbaniTypeMutation,
  useUpdateQurbaniTypeMutation,
  useDeleteQurbaniTypeMutation,
  useUpdateQurbaniTypeStatusMutation 
} = qurbaniTypesSlice; 