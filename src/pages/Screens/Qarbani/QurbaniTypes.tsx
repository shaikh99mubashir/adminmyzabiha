import { useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useGetQurbaniTypesQuery, useUpdateQurbaniTypeStatusMutation, useCreateQurbaniTypeMutation, useUpdateQurbaniTypeMutation, useDeleteQurbaniTypeMutation } from '../../../redux/services/qurbaniTypesSlice';
import type { ColDef } from 'ag-grid-community';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import Button from '../../../components/ui/button/Button';
import { Modal } from '../../../components/ui/modal';
import InputField from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import Select from '../../../components/form/Select';
import Swal from 'sweetalert2';

interface QurbaniTypeRow {
  _id: string;
  name: string;
  isActive: boolean;
}

const QurbaniTypes = () => {
  const { data: qurbaniTypes, isLoading, error } = useGetQurbaniTypesQuery();
  const [updateQurbaniTypeStatus, { isLoading: isUpdating }] = useUpdateQurbaniTypeStatusMutation();
  const [createQurbaniType, { isLoading: isCreating }] = useCreateQurbaniTypeMutation();
  const [updateQurbaniType, { isLoading: isUpdatingType }] = useUpdateQurbaniTypeMutation();
  const [deleteQurbaniType, { isLoading: isDeleting }] = useDeleteQurbaniTypeMutation();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingType, setEditingType] = useState<QurbaniTypeRow | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  


  // Debug logging
  console.log("Qurbani Types data:", qurbaniTypes);
  console.log("Qurbani Types data type:", typeof qurbaniTypes);
  console.log("Qurbani Types data length:", qurbaniTypes?.length);
  console.log("Qurbani Types loading:", isLoading);
  console.log("Qurbani Types error:", error);

  // Modal handlers
  const openModal = () => {
    setIsEditMode(false);
    setEditingType(null);
    setName('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (qurbaniType: QurbaniTypeRow) => {
    setIsEditMode(true);
    setEditingType(qurbaniType);
    setName(qurbaniType.name);
    setIsActive(qurbaniType.isActive);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingType(null);
    setName('');
    setIsActive(true);
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      Swal.fire({ 
        title: "Error", 
        text: "Qurbani type name is required", 
        icon: "error",
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'z-[999999]'
        }
      });
      return;
    }
    
    try {
      if (isEditMode && editingType) {
        await updateQurbaniType({
          id: editingType._id,
          name: name.trim(),
          isActive
        }).unwrap();
        Swal.fire({ 
          title: "Success", 
          text: "Qurbani type updated successfully!", 
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'z-[999999]'
          }
        });
      } else {
        await createQurbaniType({
          name: name.trim(),
          isActive
        }).unwrap();
        Swal.fire({ 
          title: "Success", 
          text: "Qurbani type created successfully!", 
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'z-[999999]'
          }
        });
      }
      closeModal();
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error?.data?.message || error?.error || "Failed to save qurbani type";
      Swal.fire({ 
        title: "Error", 
        text: errorMessage, 
        icon: "error",
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'z-[999999]'
        }
      });
    }
  };

  const handleDelete = async (qurbaniType: QurbaniTypeRow) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${qurbaniType.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteQurbaniType({ id: qurbaniType._id }).unwrap();
        Swal.fire({ 
          title: "Deleted!", 
          text: "Qurbani type has been deleted.", 
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'z-[999999]'
          }
        });
      } catch (error: any) {
        console.error('Delete error:', error);
        const errorMessage = error?.data?.message || error?.error || "Failed to delete qurbani type";
        Swal.fire({ 
          title: "Error", 
          text: errorMessage, 
          icon: "error",
          confirmButtonColor: '#d33',
          customClass: {
            popup: 'z-[999999]'
          }
        });
      }
    }
  };

  const handleStatusToggle = useCallback(
    async (qurbaniType: QurbaniTypeRow) => {
      try {
        console.log("Updating qurbani type:", qurbaniType);
        console.log("New status will be:", !qurbaniType.isActive);
        
        const result = await updateQurbaniTypeStatus({ 
          id: qurbaniType._id, 
          isActive: !qurbaniType.isActive 
        }).unwrap();
        
        console.log("Qurbani type update successful:", result);
      } catch (error) {
        console.error("Qurbani type update failed:", error);
      }
    },
    [updateQurbaniTypeStatus]
  );

  const colDefs: ColDef<QurbaniTypeRow>[] = [
    {
      headerName: 'Actions',
      field: '_id',
      width: 200,
      pinned: 'left',
      cellClass: 'flex items-center justify-center',
      headerClass: 'text-center font-semibold',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: (params: any) => {
        const qurbaniType = params.data as QurbaniTypeRow;
        const isActive = qurbaniType.isActive;
        
        return (
          <div className="flex items-center justify-center gap-2 h-full">
            {/* Status Toggle Button */}
            <button
              onClick={() => handleStatusToggle(qurbaniType)}
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
                ${!isUpdating && 'hover:scale-105 active:scale-95'}
              `}
              title={`Click to ${isActive ? 'deactivate' : 'activate'} this qurbani type`}
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
              onClick={() => openEditModal(qurbaniType)}
              disabled={isUpdatingType}
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
              title="Edit qurbani type"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(qurbaniType)}
              disabled={isDeleting}
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
              title="Delete qurbani type"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      },
    },
    {
      field: 'name',
      headerName: '🕌 Qurbani Type Name',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 300,
      cellRenderer: (params: any) => {
        const name = params.value;
        return (
          <div className="flex items-center h-full">
            <span className="font-semibold text-gray-900">{name || 'Unknown'}</span>
          </div>
        );
      },
      cellClass: 'font-semibold',
      headerClass: 'font-semibold',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      cellRenderer: (params: any) => params.value ? 'Yes' : 'No',
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
  ];

  // Extract array from object if needed
  const qurbaniTypeRows = Array.isArray(qurbaniTypes)
    ? qurbaniTypes
    : (qurbaniTypes as any)?.data
      ? (qurbaniTypes as any).data
      : (qurbaniTypes as any)?.qurbaniTypes
        ? (qurbaniTypes as any).qurbaniTypes
        : Object.values(qurbaniTypes || {});

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading qurbani types</div>;

  return (
    <div>
      <PageMeta
        title="Qurbani Types | MyZabiha Admin"
        description="Manage and view all qurbani types"
      />
      <PageBreadcrumb pageTitle="Qurbani Type" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-between sm:items-center sm:gap-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Qurbani Types Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage all qurbani types
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={openModal}>
            Add Qurbani Type
          </Button>
        </div>
        <div style={{ height: 600 }}>
          <AgGridReact<QurbaniTypeRow>
            rowData={qurbaniTypeRows}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
            className="ag-theme-alpine"
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditMode ? "Edit Qurbani Type" : "Add Qurbani Type"}
        </h3>
        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isCreating || isUpdatingType}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name Field */}
        <div>
          <Label htmlFor="name">Qurbani Type Name</Label>
          <InputField
            type="text"
            placeholder="Enter qurbani type name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Status Field */}
        <div>
          <Label htmlFor="isActive">Status</Label>
          <Select
            value={isActive ? "true" : "false"}
            onChange={(value) => setIsActive(value === "true")}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" }
            ]}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={closeModal}
            disabled={isCreating || isUpdatingType}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isCreating || isUpdatingType}
          >
            {isCreating || isUpdatingType ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {isEditMode ? "Updating..." : "Creating..."}
              </div>
            ) : (
              isEditMode ? "Update" : "Create"
            )}
          </Button>
        </div>
      </form>
    </div>
  </div>
</Modal>
    </div>
  );
};

export default QurbaniTypes; 