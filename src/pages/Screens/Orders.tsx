import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { AgGridReact } from 'ag-grid-react';
import { useGetOrdersQuery } from "../../redux/services/ordersSlice";
import { UPLOADS_URL } from "../../constants/api";
import Badge from "../../components/ui/badge/Badge";

export default function Orders() {
    const [rowData, setRowData] = useState<any[]>([]);
    
    // RTK Query hooks
    const { data: ordersData, isLoading, error } = useGetOrdersQuery(undefined);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs] = useState<any>([
        {
            field: "orderId",
            headerName: "Order ID",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <span className="font-mono text-sm">#{params.data._id.slice(-8)}</span>
            ),
            width: 120,
        },
        {
            field: "customerName",
            headerName: "Customer Name",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <div>
                    <div className="font-medium">{params.value}</div>
                    <div className="text-xs text-gray-500">{params.data.customerEmail}</div>
                    <div className="text-xs text-gray-500">{params.data.customerPhone}</div>
                </div>
            ),
            width: 200,
        },
        {
            field: "items",
            headerName: "Items",
            filter: false,
            cellRenderer: (params: any) => (
                <div className="max-w-xs">
                    {params.value && params.value.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1 p-1 border-b border-gray-100">
                            {item.category && item.category.image && (
                                <img
                                    src={`${UPLOADS_URL}Uploads/${item.category.image}`}
                                    alt={item.category.name}
                                    className="w-8 h-8 rounded object-cover"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{item.category?.name || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ),
            width: 300,
        },
        {
            field: "orderTotalPrice",
            headerName: "Total",
            filter: 'agNumberColumnFilter',
            cellRenderer: (params: any) => (
                <div>
                    <div className="font-medium">₹{params.value}</div>
                    <div className="text-xs text-gray-500">Sub: ₹{params.data.subtotal}</div>
                    <div className="text-xs text-gray-500">Shipping: ₹{params.data.shipping}</div>
                </div>
            ),
            width: 120,
        },
        {
            field: "status",
            headerName: "Status",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => {
                const status = params.value;
                const statusConfig = {
                    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
                    confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
                    processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
                    shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
                    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
                    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
                };
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
                
                return (
                    <Badge className={config.color}>
                        {config.label}
                    </Badge>
                );
            },
            width: 120,
        },
        {
            field: "paymentStatus",
            headerName: "Payment",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => {
                const paymentStatus = params.value;
                const paymentConfig = {
                    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
                    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
                    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
                };
                const config = paymentConfig[paymentStatus as keyof typeof paymentConfig] || paymentConfig.pending;
                
                return (
                    <Badge className={config.color}>
                        {config.label}
                    </Badge>
                );
            },
            width: 100,
        },
        {
            field: "paymentMethod",
            headerName: "Payment Method",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <span className="capitalize">{params.value}</span>
            ),
            width: 120,
        },
        {
            field: "delivery",
            headerName: "Delivery",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <Badge className={params.value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {params.value ? 'Home Delivery' : 'Pickup'}
                </Badge>
            ),
            width: 120,
        },
        {
            field: "address",
            headerName: "Address",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <div className="max-w-xs text-sm">
                    {params.value}
                </div>
            ),
            width: 200,
        },
        {
            field: "createdAt",
            headerName: "Order Date",
            filter: 'agDateColumnFilter',
            cellRenderer: (params: any) => (
                <div>
                    <div className="text-sm">{new Date(params.value).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(params.value).toLocaleTimeString()}</div>
                </div>
            ),
            width: 150,
        },
    ]);

    // Process orders data
    useEffect(() => {
        if (ordersData) {
            setRowData(ordersData);
        }
    }, [ordersData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-500">Error loading orders</div>
            </div>
        );
    }

    return (
        <div>
            <PageMeta
                title="Orders | MyZabiha Admin"
                description="Manage and view all customer orders"
            />
            <PageBreadcrumb pageTitle="Orders" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Orders Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        View and manage all customer orders
                    </p>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Orders: {rowData.length}
                    </div>
                </div>

                <div style={{ height: 600 }}>
                    <AgGridReact
                        rowData={rowData}
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
} 