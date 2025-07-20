import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

export const qurbaniAnimalTypesSlice = createApi({
  reducerPath: 'qurbaniAnimalTypesSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['QurbaniAnimalTypes'],
  endpoints: (builder) => ({
    getQurbaniAnimalTypes: builder.query<any[], void>({
      query: () => {
        console.log('Fetching qurbani animal types from:', '/qurbani-animal-types');
        return '/qurbani-animal-types';
      },
      providesTags: ['QurbaniAnimalTypes'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('Qurbani Animal Types API response:', result.data);
        } catch (error) {
          console.error('Failed to fetch qurbani animal types:', error);
        }
      },
    }),
    createQurbaniAnimalType: builder.mutation<any, any>({
      query: (animalTypeData) => {
        console.log('Making POST request to /qurbani-animal-types with body:', animalTypeData);
        return {
          url: '/qurbani-animal-types',
          method: 'POST',
          body: animalTypeData,
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniAnimalTypes'],
      async onQueryStarted(animalTypeData, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log('Qurbani Animal Type created successfully:', animalTypeData);
        } catch (error) {
          console.error('Failed to create qurbani animal type:', error);
        }
      },
    }),
    updateQurbaniAnimalType: builder.mutation<any, { id: string; [key: string]: any }>({
      query: ({ id, ...animalTypeData }) => {
        console.log(`Making PUT request to /qurbani-animal-types/${id} with body:`, animalTypeData);
        return {
          url: `/qurbani-animal-types/${id}`,
          method: 'PUT',
          body: animalTypeData,
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniAnimalTypes'],
      async onQueryStarted({ id, ...animalTypeData }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(`Qurbani Animal Type ${id} updated successfully:`, animalTypeData);
        } catch (error) {
          console.error('Failed to update qurbani animal type:', error);
        }
      },
    }),
    deleteQurbaniAnimalType: builder.mutation<any, { id: string }>({
      query: ({ id }) => {
        console.log(`Making DELETE request to /qurbani-animal-types/${id}`);
        return {
          url: `/qurbani-animal-types/${id}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniAnimalTypes'],
      async onQueryStarted({ id }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log(`Qurbani Animal Type ${id} deleted successfully`);
        } catch (error) {
          console.error('Failed to delete qurbani animal type:', error);
        }
      },
    }),
    updateQurbaniAnimalTypeStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => {
        console.log(`Making PUT request to /qurbani-animal-types/${id} with body:`, { isActive });
        return {
          url: `/qurbani-animal-types/${id}`,
          method: 'PUT',
          body: { isActive },
          headers: { 'Content-Type': 'application/json' },
        };
      },
      invalidatesTags: ['QurbaniAnimalTypes'],
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
  useGetQurbaniAnimalTypesQuery,
  useCreateQurbaniAnimalTypeMutation,
  useUpdateQurbaniAnimalTypeMutation,
  useDeleteQurbaniAnimalTypeMutation,
  useUpdateQurbaniAnimalTypeStatusMutation
} = qurbaniAnimalTypesSlice; 