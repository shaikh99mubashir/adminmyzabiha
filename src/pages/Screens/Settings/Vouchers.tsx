import { useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useGetVouchersQuery, useUpdateVoucherStatusMutation, useCreateVoucherMutation, useUpdateVoucherMutation } from '../../../redux/services/vouchersSlice';
import type { ColDef } from 'ag-grid-community';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import Button from '../../../components/ui/button/Button';
import { Modal } from '../../../components/ui/modal';
import InputField from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import Select from '../../../components/form/Select';
import DatePicker from '../../../components/form/date-picker';

interface VoucherRow {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  usageLimit?: number;
  validFrom?: string;
  validTo?: string;
  appliesTo: { type: string }[];
}

const Vouchers = () => {
  const { data: vouchers, isLoading, error } = useGetVouchersQuery();
  const [updateVoucherStatus, { isLoading: isUpdating }] = useUpdateVoucherStatusMutation();
  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation();
  const [updateVoucher, { isLoading: isUpdatingVoucher }] = useUpdateVoucherMutation();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<VoucherRow | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    usageLimit: 0,
    validFrom: '',
    validTo: '',
    appliesTo: [{ type: 'qurbaniOrder' }]
  });

  const handleStatusToggle = useCallback(
    (voucher: VoucherRow) => {
      updateVoucherStatus({ id: voucher._id, isActive: !voucher.isActive });
    },
    [updateVoucherStatus]
  );

  const handleEdit = (voucher: VoucherRow) => {
    setEditData(voucher);
    setFormData({
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      usageLimit: voucher.usageLimit || 0,
      validFrom: voucher.validFrom || '',
      validTo: voucher.validTo || '',
      appliesTo: voucher.appliesTo
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditData(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      usageLimit: 0,
      validFrom: '',
      validTo: '',
      appliesTo: [{ type: 'qurbaniOrder' }]
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editData) {
        await updateVoucher({ id: editData._id, body: formData }).unwrap();
      } else {
        await createVoucher(formData).unwrap();
      }
      setIsModalOpen(false);
      setEditData(null);
    } catch (error) {
      console.error('Error saving voucher:', error);
    }
  };

  const colDefs: ColDef<VoucherRow>[] = [
    {
      headerName: 'Actions',
      field: '_id',
      width: 140,
      pinned: 'left',
      cellClass: 'flex items-center justify-center',
      headerClass: 'text-center font-semibold',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: (params: any) => {
        const isActive = (params.data as VoucherRow).isActive;
        return (
          <div className="flex items-center justify-center h-full gap-2">
            <button
              onClick={() => handleEdit(params.data as VoucherRow)}
              className="text-blue-500 hover:text-blue-700 p-1"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleStatusToggle(params.data as VoucherRow)}
              disabled={isUpdating}
              className={`
                group relative inline-flex items-center justify-center
                px-3 py-1.5 text-xs font-semibold rounded-lg
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-1
                disabled:opacity-60 disabled:cursor-not-allowed
                min-w-[90px] h-7 shadow-sm
                ${isActive 
                  ? `bg-gradient-to-r from-red-500 to-red-600 text-white
                     hover:from-red-600 hover:to-red-700 focus:ring-red-500/50
                     shadow-red-500/25` 
                  : `bg-gradient-to-r from-green-500 to-green-600 text-white
                     hover:from-green-600 hover:to-green-700 focus:ring-green-500/50
                     shadow-green-500/25`
                }
                ${!isUpdating && 'hover:scale-105 active:scale-95'}
              `}
              title={`Click to ${isActive ? 'deactivate' : 'activate'} this voucher`}
            >
              {isUpdating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1" />
                  <span>...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-red-200' : 'bg-green-200'}`} />
                  {isActive ? 'Deactivate' : 'Activate'}
                </div>
              )}
            </button>
          </div>
        );
      },
    },
    {
      field: 'code',
      headerName: 'Voucher Code',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 140,
      cellClass: 'font-semibold',
      headerClass: 'font-semibold',
    },
    {
      field: 'discountType',
      headerName: 'Discount Type',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 120,
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
    {
      field: 'discountValue',
      headerName: 'Discount Value',
      filter: 'agNumberColumnFilter',
      sortable: true,
      width: 120,
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
    {
      field: 'usageLimit',
      headerName: 'Usage Limit',
      filter: 'agNumberColumnFilter',
      sortable: true,
      width: 120,
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
    {
      field: 'validFrom',
      headerName: 'Valid From',
      width: 140,
      cellRenderer: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : '-',
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
    {
      field: 'validTo',
      headerName: 'Valid To',
      width: 140,
      cellRenderer: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : '-',
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
    {
      field: 'appliesTo',
      headerName: 'Applies To',
      width: 200,
      cellRenderer: (params: any) => {
        const applies = params.data.appliesTo;
        if (!applies || !Array.isArray(applies)) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {applies.map((a: any, idx: number) => (
              <span key={idx} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                {a.type}
              </span>
            ))}
          </div>
        );
      },
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
    {
      field: 'isActive',
      headerName: 'Active',
      width: 100,
      cellRenderer: (params: any) => params.value ? 'Yes' : 'No',
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading vouchers</div>;

  return (
    <div>
      <PageMeta
        title="Vouchers | MyZabiha Admin"
        description="Manage and view all vouchers"
      />
      <PageBreadcrumb pageTitle="Voucher" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Vouchers Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all vouchers
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={handleCreate}>
            Create Voucher
          </Button>
        </div>
        <div style={{ height: 600 }}>
          <AgGridReact<VoucherRow>
            rowData={vouchers}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
            className="ag-theme-alpine"
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {isEditMode ? 'Edit Voucher' : 'Create Voucher'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Voucher Code</Label>
              <InputField
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Enter voucher code"
              />
            </div>
            <div>
              <Label>Discount Type</Label>
              <Select
                options={[
                  { value: 'percentage', label: 'Percentage' },
                  { value: 'fixed', label: 'Fixed Amount' }
                ]}
                value={formData.discountType}
                onChange={(value) => setFormData({...formData, discountType: value})}
                className="dark:bg-gray-900"
              />
            </div>
            <div>
              <Label>Discount Value</Label>
              <InputField
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                placeholder="Enter discount value"
              />
            </div>
            <div>
              <Label>Usage Limit</Label>
              <InputField
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                placeholder="Enter usage limit"
              />
            </div>
            <div>
              <DatePicker
                id="valid-from-picker"
                label="Valid From"
                placeholder="Select start date"
                onChange={(selectedDates: Date[]) => {
                  setFormData({
                    ...formData,
                    validFrom: selectedDates[0] ? selectedDates[0].toISOString() : ''
                  });
                }}
              />
            </div>
            <div>
              <DatePicker
                id="valid-to-picker"
                label="Valid To"
                placeholder="Select end date"
                onChange={(selectedDates: Date[]) => {
                  setFormData({
                    ...formData,
                    validTo: selectedDates[0] ? selectedDates[0].toISOString() : ''
                  });
                }}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Applies To</Label>
              <Select
                options={[
                  { value: 'qurbaniOrder', label: 'Qurbani Order' },
                  { value: 'productOrder', label: 'Product Order' }
                ]}
                value={formData.appliesTo[0]?.type || 'qurbaniOrder'}
                onChange={(value) => setFormData({...formData, appliesTo: [{ type: value }]})}
                className="dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              disabled={isCreating || isUpdatingVoucher}
            >
              {isCreating || isUpdatingVoucher ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vouchers; 