import { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useGetCountriesQuery, useUpdateCountryStatusMutation } from '../../../redux/services/countriesSlice';
import type { ColDef } from 'ag-grid-community';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';

interface CountryRow {
  _id: string;
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  countryCode: string;
  currency_name: string;
  capital: string[];
  region: string;
  isActive: boolean;
}

const Countries = () => {
  const { data: countries, isLoading, error } = useGetCountriesQuery();
  const [updateCountryStatus, { isLoading: isUpdating }] = useUpdateCountryStatusMutation();

  const handleStatusToggle = useCallback(
    (country: CountryRow) => {
      console.log("country",country);
      
      updateCountryStatus({ id: country._id, isActive: !country.isActive });
    },
    [updateCountryStatus]
  );

  const colDefs: ColDef<CountryRow>[] = [
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
        const isActive = (params.data as CountryRow).isActive;
        
        return (
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleStatusToggle(params.data as CountryRow)}
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
              title={`Click to ${isActive ? 'deactivate' : 'activate'} this country`}
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
      field: 'name.common' as any, 
      headerName: '🌍 Country Name', 
      valueGetter: (params:any) => params.data.name?.common, 
      filter: true,
      width: 220,
      cellRenderer: (params: any) => {
        const name = params.data.name?.common;
        const flagUrl = params.data.flags?.png || params.data.flags?.svg;
        return (
          <div className="flex items-center h-full">
            {flagUrl && (
              <img
                src={flagUrl}
                alt={name + ' flag'}
                className="w-6 h-4 rounded-sm mr-2 border border-gray-200 object-cover"
                loading="lazy"
              />
            )}
            <span className="font-semibold text-gray-900">{name || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      field: 'countryCode',
      headerName: '🏷️ Country Code',
      width: 140,
      filter: 'agTextColumnFilter',
      sortable: true,
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
      cellRenderer: (params: any) => {
        const code = params.value;
        return (
          <div className="flex items-center justify-center h-full">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {code || 'N/A'}
            </span>
          </div>
        );
      },
    },
  
    {
      field: 'currency_name',
      headerName: '💰 Currency',
      width: 160,
      filter: 'agTextColumnFilter',
      sortable: true,
      cellClass: 'font-medium',
      headerClass: 'font-semibold',
      cellRenderer: (params: any) => {
        const currency = params.value;
        const currencySymbol = params.data.currency_symbol || params.data.currencySymbol || '';
        return (
          <div className="flex items-center h-full">
            {currencySymbol && <span className="text-green-600 mr-1">{currencySymbol}</span>}
            <span className="text-gray-900">
              {currency || 'Unknown'}
            </span>
          </div>
        );
      },
    },
    {
      field: 'capital' as any,
      headerName: '🏛️ Capital',
      width: 160,
      valueGetter: (params: any) => params.data.capital?.[0],
      filter: 'agTextColumnFilter',
      sortable: true,
      cellClass: 'font-medium',
      headerClass: 'font-semibold',
      cellRenderer: (params: any) => {
        const capital = params.data.capital?.[0];
        
        return (
          <div className="flex items-center h-full">
            <span className="text-gray-900">
              {capital || 'Unknown'}
            </span>
          </div>
        );
      },
    },
  
    {
      field: 'region',
      headerName: '🌐 Region',
      width: 150,
      filter: 'agTextColumnFilter',
      sortable: true,
      cellClass: 'text-center',
      headerClass: 'text-center font-semibold',
      cellRenderer: (params: any) => {
        const region = params.value;
        
        // Color coding for different regions
        const getRegionColor = (region: string) => {
          switch (region?.toLowerCase()) {
            case 'africa':
              return 'bg-orange-100 text-orange-800';
            case 'asia':
              return 'bg-red-100 text-red-800';
            case 'europe':
              return 'bg-blue-100 text-blue-800';
            case 'americas':
              return 'bg-green-100 text-green-800';
            case 'oceania':
              return 'bg-purple-100 text-purple-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        
        return (
          <div className="flex items-center justify-center h-full">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRegionColor(region)}`}>
              {region || 'Unknown'}
            </span>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading countries</div>;

  return (
    <div>
      <PageMeta
        title="Countries | MyZabiha Admin"
        description="Manage and view all countries"
      />
      <PageBreadcrumb pageTitle="Country" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Countries Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all countries
          </p>
        </div>
        <div style={{ height: 600 }}>
          <AgGridReact<CountryRow>
            rowData={countries}
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

export default Countries;
