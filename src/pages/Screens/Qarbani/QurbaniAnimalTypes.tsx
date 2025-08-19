import { useCallback, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  useGetQurbaniAnimalTypesQuery,
  useCreateQurbaniAnimalTypeMutation,
  useUpdateQurbaniAnimalTypeMutation,
  useDeleteQurbaniAnimalTypeMutation,
  useUpdateQurbaniAnimalTypeStatusMutation
} from '../../../redux/services/qurbaniAnimalTypesSlice';
import type { ColDef } from 'ag-grid-community';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import Button from '../../../components/ui/button/Button';
import { Modal } from '../../../components/ui/modal';
import InputField from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import Select from '../../../components/form/Select';
import Swal from 'sweetalert2';
import MultiSelect from '../../../components/form/MultiSelect';

interface QurbaniAnimalRow {
  _id: string;
  name: string;
  quantity: number;
  sharePrice: number;
  fullPrice: number;
  currency: string;
  isActive: boolean;
  availableForTypes: string[];
  maxShares: number;
  prices?: Array<{
    currency: string;
    symbol: string;
    currency_name: string;
    sharePrice: number;
    fullPrice: number;
  }>;
}

const currencyOptions = [
  { value: 'PKR', label: 'PKR' },
];

const QurbaniAnimalTypes = () => {
  const { data: qurbaniAnimalTypes } = useGetQurbaniAnimalTypesQuery();
  const [updateQurbaniAnimalTypeStatus] = useUpdateQurbaniAnimalTypeStatusMutation();
  const [createQurbaniAnimalType] = useCreateQurbaniAnimalTypeMutation();
  const [updateQurbaniAnimalType] = useUpdateQurbaniAnimalTypeMutation();
  const [deleteQurbaniAnimalType] = useDeleteQurbaniAnimalTypeMutation();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingType, setEditingType] = useState<QurbaniAnimalRow | null>(null);

  // Explicitly type the form state
  const [form, setForm] = useState<{
    name: string;
    quantity: number;
    sharePrice: number;
    fullPrice: number;
    currency: string;
    isActive: boolean;
    availableForTypes: string[];
    maxShares: number;
  }>({
    name: '',
    quantity: 1,
    sharePrice: 0,
    fullPrice: 0,
    currency: 'PKR',
    isActive: true,
    availableForTypes: [],
    maxShares: 1,
  });

  // Add state for available types list
  const [availableTypesList, setAvailableTypesList] = useState<{ _id: string; name: string }[]>([]);

  // Fetch available types from all animal types (for select options)
  useEffect(() => {
    if (qurbaniAnimalTypes && Array.isArray(qurbaniAnimalTypes)) {
      const allTypes: { _id: string; name: string }[] = [];
      qurbaniAnimalTypes.forEach((animal: any) => {
        if (Array.isArray(animal.availableForTypes)) {
          animal.availableForTypes.forEach((type: any) => {
            if (type && type._id && type.name && !allTypes.some(t => t._id === type._id)) {
              allTypes.push({ _id: type._id, name: type.name });
            }
          });
        }
      });
      setAvailableTypesList(allTypes);
    }
  }, [qurbaniAnimalTypes]);

  // Modal handlers
  const openModal = () => {
    setIsEditMode(false);
    setEditingType(null);
    setForm({
      name: '',
      quantity: 1,
      sharePrice: 0,
      fullPrice: 0,
      currency: 'PKR',
      isActive: true,
      availableForTypes: [],
      maxShares: 1,
    });
    setIsModalOpen(true);
  };

  // In openEditModal, map availableForTypes to array of _id
  const openEditModal = (row: QurbaniAnimalRow) => {
    setIsEditMode(true);
    setEditingType(row);
    setForm({
      name: row.name,
      quantity: row.quantity,
      sharePrice: row.sharePrice,
      fullPrice: row.fullPrice,
      currency: row.currency,
      isActive: row.isActive,
      availableForTypes: Array.isArray(row.availableForTypes)
        ? row.availableForTypes.map((type: any) => (typeof type === 'string' ? type : type._id))
        : [],
      maxShares: row.maxShares,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingType(null);
    setForm({
      name: '',
      quantity: 1,
      sharePrice: 0,
      fullPrice: 0,
      currency: 'PKR',
      isActive: true,
      availableForTypes: [],
      maxShares: 1,
    });
  };

  // Update handleFormChange with type guard for checkbox
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && 'checked' in e.target) {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      Swal.fire({ title: 'Error', text: 'Name is required', icon: 'error' });
      return;
    }
    const submitData = {
      ...form,
      availableForTypes: form.availableForTypes.map((type: any) =>
        typeof type === 'string' ? type : type._id
      ),
    };
    try {
      if (isEditMode && editingType) {
        await updateQurbaniAnimalType({ id: editingType._id, ...submitData }).unwrap();
        Swal.fire({ title: 'Success', text: 'Qurbani Animal updated!', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        await createQurbaniAnimalType(submitData).unwrap();
        Swal.fire({ title: 'Success', text: 'Qurbani Animal created!', icon: 'success', timer: 2000, showConfirmButton: false });
      }
      closeModal();
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error?.data?.message || 'Failed to save', icon: 'error' });
    }
  };

  const handleDelete = async (row: QurbaniAnimalRow) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete "${row.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await deleteQurbaniAnimalType({ id: row._id }).unwrap();
        Swal.fire({ title: 'Deleted!', text: 'Qurbani Animal deleted.', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error: any) {
        Swal.fire({ title: 'Error', text: error?.data?.message || 'Failed to delete', icon: 'error' });
      }
    }
  };

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const handleStatusToggle = useCallback(async (row: QurbaniAnimalRow) => {
    setUpdatingStatusId(row._id);
    try {
      await updateQurbaniAnimalTypeStatus({ id: row._id, isActive: !row.isActive }).unwrap();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to update status', icon: 'error' });
    } finally {
      setUpdatingStatusId(null);
    }
  }, [updateQurbaniAnimalTypeStatus]);

  const colDefs: ColDef<QurbaniAnimalRow>[] = [
    {
      headerName: '⚡ Actions',
      field: '_id',
      width: 260,
      cellClass: 'actions-cell',
      cellRenderer: (params: any) => {
        const animal = params.data;
        const isActive = animal.isActive;
        const isUpdating = updatingStatusId === animal._id;
        return (
          <div className="flex items-center justify-center gap-2 h-full">
            {/* Status Toggle Button */}
            <button
              onClick={() => handleStatusToggle(animal)}
              disabled={isUpdating}
              className={`
                group relative inline-flex items-center justify-center
                px-2 py-1 text-xs font-semibold rounded-lg
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-1
                disabled:opacity-60 disabled:cursor-not-allowed
                min-w-[80px] h-6 shadow-sm
                ${isActive
                  ? `bg-gradient-to-r from-red-500 to-red-600 text-white
                     hover:from-red-600 hover:to-red-700 focus:ring-red-500/50
                     shadow-red-500/25`
                  : `bg-gradient-to-r from-green-500 to-green-600 text-white
                     hover:from-green-600 hover:to-green-700 focus:ring-green-500/50
                     shadow-green-500/25`
                }
                ${!isUpdating ? 'hover:scale-105 active:scale-95' : ''}
              `}
              title={`Click to ${isActive ? 'deactivate' : 'activate'} this qurbani animal`}
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
            {/* Edit Button */}
            <button
              onClick={() => openEditModal(animal)}
              className="
                group relative inline-flex items-center justify-center
                p-1.5 text-xs font-semibold rounded-lg
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-1
                disabled:opacity-60 disabled:cursor-not-allowed
                w-6 h-6 shadow-sm
                bg-gradient-to-r from-blue-500 to-blue-600 text-white
                hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500/50
                shadow-blue-500/25 hover:scale-105 active:scale-95
              "
              title="Edit qurbani animal"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {/* Delete Button */}
            <button
              onClick={() => handleDelete(animal)}
              className="
                group relative inline-flex items-center justify-center
                p-1.5 text-xs font-semibold rounded-lg
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-1
                disabled:opacity-60 disabled:cursor-not-allowed
                w-6 h-6 shadow-sm
                bg-gradient-to-r from-red-500 to-red-600 text-white
                hover:from-red-600 hover:to-red-700 focus:ring-red-500/50
                shadow-red-500/25 hover:scale-105 active:scale-95
              "
              title="Delete qurbani animal"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      },
      pinned: 'left',
    },
    {
      headerName: '🐄 Animal Name',
      field: 'name',
      width: 160,
      cellClass: 'animal-cell',
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full space-x-3 py-2">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute top-0 left-0 w-3 h-3 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="font-bold text-gray-800 capitalize tracking-wide text-sm drop-shadow-sm">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      headerName: '📊 Quantity',
      field: 'quantity',
      width: 120,
      cellClass: 'quantity-cell',
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full">
          <div className="relative group">
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 border-2 border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
              {params.value}
            </span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10 blur-md"></div>
          </div>
        </div>
      ),
    },
    {
      headerName: '💱 All Prices',
      field: 'prices',
      width: 320,
      cellClass: 'prices-cell',
      autoHeight: true,
      cellRenderer: (params: any) => (
        <div className="flex flex-col gap-2.5 py-3">
          {Array.isArray(params.value) && params.value.length > 0 ? (
            params.value.map((price: any, idx: number) => (
              <div
                key={idx}
                className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200/60 rounded-2xl px-4 py-2.5 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm"
              >
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-600">{price.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-600">{price.sharePrice}</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-emerald-600">{price.fullPrice}</span>
                    </div>
                    <span className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-2 py-1 rounded-lg border border-amber-200/50">
                      {price.currency}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-sm italic py-3 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-gray-200/50">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              No prices available
            </span>
          )}
        </div>
      ),
    },
    {
      headerName: '🏷️ Available For Types',
      field: 'availableForTypes',
      width: 280,
      minWidth: 260,
      flex: 1,
      cellClass: 'types-cell',
      autoHeight: true,
      wrapText: true,
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '16px',
        paddingRight: '16px',
        lineHeight: '1.5',
        whiteSpace: 'normal'
      },
      cellRenderer: (params: any) => (
        <div className="flex flex-wrap gap-2.5 items-center justify-start w-full min-h-[48px]">
          {Array.isArray(params.value) && params.value.length > 0 ? (
            params.value.map((type: any, index: number) => (
              <div
                key={typeof type === 'string' ? `${type}-${index}` : `${type._id}-${index}`}
                className="group relative"
              >
                <span 
                  className={`inline-flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:scale-105 cursor-default shadow-lg hover:shadow-xl whitespace-nowrap backdrop-blur-sm border-2 ${
                    index % 4 === 0 
                      ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 border-blue-200/60 hover:border-blue-300/80' 
                      : index % 4 === 1 
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-800 border-purple-200/60 hover:border-purple-300/80'
                      : index % 4 === 2
                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 border-green-200/60 hover:border-green-300/80'
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 border-amber-200/60 hover:border-amber-300/80'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2.5 flex-shrink-0 animate-pulse ${
                    index % 4 === 0 ? 'bg-blue-400' : index % 4 === 1 ? 'bg-purple-400' : index % 4 === 2 ? 'bg-green-400' : 'bg-amber-400'
                  }`}></div>
                  <span className="text-ellipsis overflow-hidden max-w-[160px] drop-shadow-sm">
                    {typeof type === 'string' ? type : type.name}
                  </span>
                </span>
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10 blur-md ${
                  index % 4 === 0 ? 'bg-blue-400/20' : index % 4 === 1 ? 'bg-purple-400/20' : index % 4 === 2 ? 'bg-green-400/20' : 'bg-amber-400/20'
                }`}></div>
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-sm italic py-3 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-gray-200/50 w-full">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              No types available
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <PageMeta title="Qurbani Animal" description="Manage all qurbani animals" />
      <PageBreadcrumb pageTitle="Qurbani Animal" />
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Qurbani Animal</h1>
          <Button onClick={openModal}>Add Qurbani Animal</Button>
        </div>
        <div className="ag-theme-quartz dark:ag-theme-quartz-dark" style={{ height: 500, width: '100%' }}>
          <AgGridReact
            rowData={Array.isArray(qurbaniAnimalTypes) ? qurbaniAnimalTypes : []}
            columnDefs={colDefs}
            domLayout="autoHeight"
            animateRows
            pagination
            paginationPageSize={10}
            getRowClass={params => params.node.isSelected() ? 'bg-blue-50 dark:bg-blue-900' : ''}
          />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="relative bg-white dark:bg-dark-900 rounded-2xl shadow-xl max-w-lg w-full mx-auto my-12 p-0 z-50 flex flex-col justify-center items-center max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Heading */}
          <div className="px-8 pt-8 pb-4 border-b border-gray-100 w-full">
            <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Qurbani Animal' : 'Add Qurbani Animal'}</h2>
          </div>
          {/* Form */}
          <form onSubmit={e => handleSubmit(e)} className="px-8 py-6 space-y-8 w-full max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Name</Label>
                <InputField name="name" value={form.name} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Max Shares</Label>
                <InputField name="maxShares" type="number" min="1" value={String(form.maxShares)} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Quantity</Label>
                <InputField name="quantity" type="number" min="1" value={String(form.quantity)} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Full Price</Label>
                <InputField name="fullPrice" type="number" min="0" value={String(form.fullPrice)} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Share Price</Label>
                <InputField name="sharePrice" type="number" min="0" value={String(form.sharePrice)} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onChange={(value) => setForm((prev) => ({ ...prev, currency: value }))}
                  options={currencyOptions}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Available For Types</Label>
                <MultiSelect
                  label=""
                  options={availableTypesList.map(type => ({ value: type._id, text: type.name }))}
                  defaultSelected={form.availableForTypes}
                  onChange={(selected) => setForm(prev => ({ ...prev, availableForTypes: selected }))}
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleFormChange} id="isActive" />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-6 border-t border-gray-100 mt-6">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button>{isEditMode ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default QurbaniAnimalTypes; 