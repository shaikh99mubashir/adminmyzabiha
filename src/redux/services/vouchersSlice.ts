import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants/api';

interface VoucherBody {
  code: string;
  discountType: string;
  discountValue: number;
  isActive?: boolean;
  usageLimit?: number;
  validFrom?: string;
  validTo?: string;
  appliesTo: { type: string }[];
}

export const vouchersSlice = createApi({
  reducerPath: 'vouchersSlice',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: 'include' }),
  tagTypes: ['Vouchers'],
  endpoints: (builder) => ({
    getVouchers: builder.query<any[], void>({
      query: () => '/vouchers',
      providesTags: ['Vouchers'],
    }),
    createVoucher: builder.mutation<any, VoucherBody>({
      query: (body) => ({
        url: '/vouchers',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Vouchers'],
    }),
    updateVoucher: builder.mutation<any, { id: string; body: VoucherBody }>({
      query: ({ id, body }) => ({
        url: `/vouchers/${id}`,
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Vouchers'],
    }),
    updateVoucherStatus: builder.mutation<any, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/vouchers/${id}`,
        method: 'PUT',
        body: { isActive },
        headers: { 'Content-Type': 'application/json' },
      }),
      invalidatesTags: ['Vouchers'],
    }),
  }),
});

export const { 
  useGetVouchersQuery, 
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useUpdateVoucherStatusMutation 
} = vouchersSlice; 