import { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useGetCurrenciesQuery, useUpdateCurrencyStatusMutation } from '../../../redux/services/currenciesSlice';
import type { ColDef } from 'ag-grid-community';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';

interface CurrencyRow {
  _id: string;
  country_name: string;
  country_flag: string;
  isActive: boolean;
  currency_name: string;
  symbol: string;
  rate: number;
}

const Currencies = () => {
  const { data: currencies, isLoading, error } = useGetCurrenciesQuery();
  const [updateCurrencyStatus, { isLoading: isUpdating }] = useUpdateCurrencyStatusMutation();

  // Debug logging
  console.log("Currencies data:", currencies);
  console.log("Currencies data type:", typeof currencies);
  console.log("Currencies data length:", currencies?.length);
  console.log("Currencies loading:", isLoading);
  console.log("Currencies error:", error);

  const handleStatusToggle = useCallback(
    async (currency: CurrencyRow) => {
      try {
        console.log("Updating currency:", currency);
        console.log("New status will be:", !currency.isActive);
        
        const result = await updateCurrencyStatus({ 
          id: currency._id, 
          isActive: !currency.isActive 
        }).unwrap();
        
        console.log("Currency update successful:", result);
      } catch (error) {
        console.error("Currency update failed:", error);
        // You can add a toast notification here if needed
      }
    },
    [updateCurrencyStatus]
  );

  const colDefs: ColDef<CurrencyRow>[] = [
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
        const isActive = (params.data as CurrencyRow).isActive;
        
        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleStatusToggle(params.data as CurrencyRow)}
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
              title={`Click to ${isActive ? 'deactivate' : 'activate'} this currency`}
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
      field: 'country_name',
      headerName: '🌍 Country',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 220,
      cellRenderer: (params: any) => {
        const countryName = params.data.country_name;
        const flagUrl = params.data.country_flag;
        return (
          <div className="flex items-center h-full">
            {flagUrl && (
              <img
                src={flagUrl}
                alt={countryName + ' flag'}
                className="w-6 h-4 rounded-sm mr-2 border border-gray-200 object-cover"
                loading="lazy"
              />
            )}
            <span className="font-semibold text-gray-900">{countryName || 'Unknown'}</span>
          </div>
        );
      },
      cellClass: 'font-semibold',
      headerClass: 'font-semibold',
    },
    {
      field: 'currency_name',
      headerName: '💰 Currency Name',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 200,
      cellClass: 'font-semibold',
      headerClass: 'font-semibold',
    },
    {
      field: 'symbol',
      headerName: '💱 Symbol',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 120,
      cellClass: 'text-center font-bold text-lg',
      headerClass: 'text-center font-semibold',
      cellRenderer: (params: any) => {
        const symbol = params.value;
        return (
          <div className="flex items-center justify-center h-full">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
              {symbol || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      field: 'rate',
      headerName: '📊 Exchange Rate',
      width: 150,
      filter: 'agNumberColumnFilter',
      sortable: true,
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
      cellRenderer: (params: any) => {
        const rate = params.value;
        return (
          <div className="flex items-center justify-center h-full">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {rate ? rate.toFixed(2) : '0.00'}
            </span>
          </div>
        );
      },
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading currencies</div>;

  return (
    <div>
      <PageMeta
        title="Currencies | MyZabiha Admin"
        description="Manage and view all currencies"
      />
      <PageBreadcrumb pageTitle="Currency" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Currencies Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all currencies
          </p>
        </div>
        <div style={{ height: 600 }}>
          <AgGridReact<CurrencyRow>
            rowData={currencies}
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

export default Currencies; 