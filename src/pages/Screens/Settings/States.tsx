import { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useGetStatesQuery, useUpdateStateStatusMutation } from '../../../redux/services/statesSlice';
import type { ColDef } from 'ag-grid-community';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';

interface StateRow {
  _id: string;
  name: string;
  state_code: string;
  isActive: boolean;
  country: string;
}

const States = () => {
  const { data: states, isLoading, error } = useGetStatesQuery();
  const [updateStateStatus, { isLoading: isUpdating }] = useUpdateStateStatusMutation();

  const handleStatusToggle = useCallback(
    (state: StateRow) => {
      updateStateStatus({ id: state._id, isActive: !state.isActive });
    },
    [updateStateStatus]
  );

  const colDefs: ColDef<StateRow>[] = [
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
        const isActive = (params.data as StateRow).isActive;
        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleStatusToggle(params.data as StateRow)}
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
              title={`Click to ${isActive ? 'deactivate' : 'activate'} this state`}
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
      field: 'name',
      headerName: '🏛️ State Name',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 200,
      cellClass: 'font-semibold',
      headerClass: 'font-semibold',
    },
    {
      field: 'state_code',
      headerName: '🏷️ State Code',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 140,
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
    },
    {
      field: 'country',
      headerName: '🌍 Country',
      valueGetter: (params: any) => params.data.country,
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 180,
      cellClass: 'font-semibold',
      headerClass: 'font-semibold',
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
  if (error) return <div>Error loading states</div>;

  return (
    <div>
      <PageMeta
        title="States | MyZabiha Admin"
        description="Manage and view all states"
      />
      <PageBreadcrumb pageTitle="State" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">States Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all states
          </p>
        </div>
        <div style={{ height: 600 }}>
          <AgGridReact<StateRow>
            rowData={states}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
            className="ag-theme-alpine"
          />
        </div>
      </div>
    </div>
  );
};

export default States;
