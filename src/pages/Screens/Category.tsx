import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { AgGridReact } from 'ag-grid-react';
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from "../../redux/services/categoriesSlice";
import Swal from "sweetalert2";
import { UPLOADS_URL } from "../../constants/api";

const ActionsCellRenderer = (props: any) => (
    <div className="flex gap-2 items-center justify-center h-full">
        <button
            onClick={() => props.onAvailability(props.data)}
            className="flex items-center justify-center w-7 h-7 text-blue-500 hover:text-blue-700"
            title="Availability"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
        </button>
        <button
            onClick={() => props.onEdit(props.data)}
            className="flex items-center justify-center w-7 h-7 text-blue-500 hover:text-blue-700"
            title="Edit"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
        </button>
        <button
            onClick={() => props.onDelete(props.data)}
            className="flex items-center justify-center w-7 h-7 text-red-500 hover:text-red-700"
            title="Delete"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5V19.125A2.625 2.625 0 0 0 8.625 21.75h6.75A2.625 2.625 0 0 0 18 19.125V7.5M9.75 10.5v6.75M14.25 10.5v6.75M4.5 7.5h15m-10.125 0V5.625A1.125 1.125 0 0 1 10.5 4.5h3a1.125 1.125 0 0 1 1.125 1.125V7.5" />
            </svg>
        </button>
    </div>
);

export default function Category() {
    const [rowData, setRowData] = useState<any[]>([]);
    console.log("row data", rowData);

    // Image popup state
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    // RTK Query hooks
    const { data: categoriesData, isLoading, error } = useGetCategoriesQuery(undefined);
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    console.log(UPLOADS_URL);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs] = useState<any>([
        {
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params: any) => (
                <ActionsCellRenderer
                    data={params.data}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAvailability={handleAvailabilityClick}
                />
            ),
            width: 120,
            filter: false,
            sortable: false,
        },
        {
            field: "categoryType",
            headerName: "Category Type",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${params.value === 'online_mandi'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                    {params.value === 'online_mandi' ? 'Online Mandi' : 'Product'}
                </span>
            ),
            width: 120,
        },
        {
            field: "mainCategory",
            headerName: "Main Category",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {params.data && params.data.mainCategoryImage ? (
                        <img
                            src={`${UPLOADS_URL}uploads/${params.data.mainCategoryImage}`}
                            alt="img"
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                            onClick={() => setSelectedImageUrl(`${UPLOADS_URL}uploads/${params.data.mainCategoryImage}`)}
                        />
                    ) : null}
                    <span>{params.value}</span>
                </div>
            )
        },
        {
            field: "subCategory",
            headerName: "Sub Category",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {params.data && params.data.subCategoryImage ? (
                        <img
                            src={`${UPLOADS_URL}uploads/${params.data.subCategoryImage}`}
                            alt="img"
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                            onClick={() => setSelectedImageUrl(`${UPLOADS_URL}uploads/${params.data.subCategoryImage}`)}
                        />
                    ) : null}
                    <span>{params.value}</span>
                </div>
            )
        },
        {
            field: "nestedCategory",
            headerName: "Nested Category",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {params.data && params.data.nestedCategoryImage && typeof params.data.nestedCategoryImage === 'string' ? (
                        <img
                            src={`${UPLOADS_URL}uploads/${params.data.nestedCategoryImage}`}
                            alt="img"
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                            onClick={() => setSelectedImageUrl(`${UPLOADS_URL}uploads/${params.data.nestedCategoryImage}`)}
                        />
                    ) : null}
                    <span>{params.value}</span>
                </div>
            )
        },
        {
            field: "description",
            headerName: "Description",
            filter: false,
            valueGetter: (params: any) =>
                params.data.nestedCategoryDescription ||
                params.data.subCategoryDescription ||
                params.data.mainCategoryDescription ||
                "",
        },
        { field: "price", headerName: "Price", filter: 'agNumberColumnFilter', valueFormatter: (params: any) => (params.value === undefined || params.value === null || params.value === '' || isNaN(Number(params.value))) ? '-' : params.value },
        { field: "unit", headerName: "Unit", filter: 'agTextColumnFilter' },
        { field: "numberOfUnits", headerName: "Number of Units", filter: 'agTextColumnFilter' },
        { field: "keywords", headerName: "Keywords", filter: 'agTextColumnFilter' },
        { field: "shortDescription", headerName: "Short Description", filter: 'agTextColumnFilter' },
        { field: "numberOfPieces", headerName: "Number of Pieces", filter: 'agTextColumnFilter' },
        { field: "mrpPrice", headerName: "MRP Price", filter: 'agNumberColumnFilter', valueFormatter: (params: any) => (params.value === undefined || params.value === null || params.value === '' || isNaN(Number(params.value))) ? '-' : params.value },
        { field: "offPercent", headerName: "Off Percent", filter: 'agNumberColumnFilter', valueFormatter: (params: any) => (params.value === undefined || params.value === null || params.value === '' || isNaN(Number(params.value))) ? '-' : params.value },
        {
            headerName: "Availability",
            field: "availability",
            cellRenderer: (params: any) => (
                <ActionsCellRenderer data={params.data} onEdit={handleEditClick} onDelete={handleDeleteClick} onAvailability={handleAvailabilityClick} />
            ),
            width: 100,
            filter: false,
            sortable: false,
        },
    ]);

    const { isOpen, openModal, closeModal } = useModal();
    const [categoryName, setCategoryName] = useState("");
    const [categoryType, setCategoryType] = useState("product");

    // Sub Category Modal State
    const { isOpen: isSubOpen, openModal: openSubModal, closeModal: closeSubModal } = useModal();
    const [subCategoryName, setSubCategoryName] = useState("");
    const [selectedMainCategory, setSelectedMainCategory] = useState("");

    // Nested Category Modal State
    const { isOpen: isNestedOpen, openModal: openNestedModal, closeModal: closeNestedModal } = useModal();
    const [nestedMainCategory, setNestedMainCategory] = useState("");
    const [nestedSubCategory, setNestedSubCategory] = useState("");
    const [nestedCategoryName, setNestedCategoryName] = useState("");
    const [nestedImage, setNestedImage] = useState<File | null>(null);
    const [nestedDescription, setNestedDescription] = useState("");
    const [nestedPrice, setNestedPrice] = useState("");
    const [nestedUnit, setNestedUnit] = useState("");
    // New fields for nested category
    const [nestedNumberOfUnits, setNestedNumberOfUnits] = useState("");
    const [nestedKeywords, setNestedKeywords] = useState("");
    const [nestedShortDescription, setNestedShortDescription] = useState("");
    const [nestedNumberOfPieces, setNestedNumberOfPieces] = useState("");
    const [nestedMrpPrice, setNestedMrpPrice] = useState("");
    const [nestedOffPercent, setNestedOffPercent] = useState("");

    // Derived price calculation for nested category
    const calculatedNestedPrice = (nestedMrpPrice !== "" || nestedOffPercent !== "")
        ? Math.round(Number(nestedMrpPrice || 0) - (Number(nestedMrpPrice || 0) * Number(nestedOffPercent || 0) / 100))
        : "";

    // Main Category modal new fields
    const [mainCategoryImage, setMainCategoryImage] = useState<File | null>(null);
    const [mainCategoryDescription, setMainCategoryDescription] = useState("");
    // Sub Category modal new fields
    const [subCategoryImage, setSubCategoryImage] = useState<File | null>(null);
    const [subCategoryDescription, setSubCategoryDescription] = useState("");

    const [mainCategoryOptionsForSub, setMainCategoryOptionsForSub] = useState<any[]>([]);
    const [mainCategoryOptionsForNested, setMainCategoryOptionsForNested] = useState<any[]>([]);
    const [subCategoryOptionsForNested, setSubCategoryOptionsForNested] = useState<Record<string, any[]>>({});

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    const [availabilityModal, setAvailabilityModal] = useState({ open: false, row: null });

    // Edit modal state
    const [editSelectOpen, setEditSelectOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editType, setEditType] = useState<'main' | 'sub' | 'nested' | null>(null);
    const [editData, setEditData] = useState<any>(null);

    // Derived price calculation for edit modal (nested category)
    const calculatedEditPrice = (editData?.mrpPrice !== "" || editData?.offPercent !== "")
        ? Math.round(Number(editData?.mrpPrice || 0) - (Number(editData?.mrpPrice || 0) * Number(editData?.offPercent || 0) / 100))
        : "";

    const handleMainCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMainCategoryImage(e.target.files[0]);
        }
    };
    const handleSubCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSubCategoryImage(e.target.files[0]);
        }
    };

    // Process categories data and set options/data
    useEffect(() => {
        if (categoriesData) {
            // Map data so each row is a chain: main, sub, nested (side by side)
            const flat: any[] = [];
            const mainOptions: any[] = [];
            const mainOptionsForNested: any[] = [];
            const subOptionsForNested: Record<string, any[]> = {};

            categoriesData.forEach((main: any) => {
                // For sub category select: only main categories (parent == null)
                if (!main.parent) {
                    mainOptions.push({ value: main._id, label: main.name });
                    mainOptionsForNested.push({ value: main._id, label: main.name });
                    // For nested: collect subcategories for each main
                    if (main.subCategories && main.subCategories.length > 0) {
                        subOptionsForNested[main._id] = main.subCategories.map((sub: any) => ({ value: sub._id, label: sub.name }));
                    } else {
                        subOptionsForNested[main._id] = [];
                    }
                }
                if (main.subCategories && main.subCategories.length > 0) {
                    main.subCategories.forEach((sub: any) => {
                        if (sub.nestedCategories && sub.nestedCategories.length > 0) {
                            sub.nestedCategories.forEach((nested: any) => {
                                flat.push({
                                    _id: nested._id,
                                    mainCategoryId: main._id,
                                    subCategoryId: sub._id,
                                    nestedCategoryId: nested._id,
                                    mainCategory: main.name,
                                    mainCategoryImage: main.image || "",
                                    mainCategoryAvailable: typeof main.available === 'boolean' ? main.available : false,
                                    mainCategoryType: main.categoryType || "product",
                                    mainCategoryDescription: main.description || "",
                                    subCategory: sub.name,
                                    subCategoryImage: sub.image || "",
                                    subCategoryAvailable: typeof sub.available === 'boolean' ? sub.available : false,
                                    subCategoryDescription: sub.description || "",
                                    nestedCategory: nested.name,
                                    nestedCategoryAvailable: typeof nested.available === 'boolean' ? nested.available : false,
                                    nestedCategoryDescription: nested.description || "",
                                    nestedCategoryImage: nested.image || "",
                                    price: nested.price || "",
                                    unit: nested.unit || "",
                                    numberOfUnits: nested.numberOfUnits || "",
                                    keywords: nested.keywords || "",
                                    shortDescription: nested.shortDescription || "",
                                    numberOfPieces: nested.numberOfPieces || "",
                                    mrpPrice: nested.mrpPrice || "",
                                    offPercent: nested.offPercent || "",
                                    categoryType: main.categoryType || "product",
                                });
                            });
                        } else {
                            flat.push({
                                _id: sub._id,
                                mainCategoryId: main._id,
                                subCategoryId: sub._id,
                                nestedCategoryId: undefined,
                                mainCategory: main.name,
                                mainCategoryImage: main.image || "",
                                mainCategoryAvailable: typeof main.available === 'boolean' ? main.available : false,
                                mainCategoryType: main.categoryType || "product",
                                mainCategoryDescription: main.description || "",
                                subCategory: sub.name,
                                subCategoryImage: sub.image || "",
                                subCategoryAvailable: typeof sub.available === 'boolean' ? sub.available : false,
                                subCategoryDescription: sub.description || "",
                                nestedCategory: "",
                                nestedCategoryAvailable: undefined,
                                nestedCategoryDescription: "",
                                nestedCategoryImage: "",
                                price: "",
                                unit: "",
                                numberOfUnits: "",
                                keywords: "",
                                shortDescription: "",
                                numberOfPieces: "",
                                mrpPrice: "",
                                offPercent: "",
                                categoryType: main.categoryType || "product",
                            });
                        }
                    });
                } else {
                    flat.push({
                        _id: main._id,
                        mainCategoryId: main._id,
                        subCategoryId: undefined,
                        nestedCategoryId: undefined,
                        mainCategory: main.name,
                        mainCategoryImage: main.image || "",
                        mainCategoryAvailable: typeof main.available === 'boolean' ? main.available : false,
                        mainCategoryType: main.categoryType || "product",
                        mainCategoryDescription: main.description || "",
                        subCategory: "",
                        subCategoryImage: "",
                        subCategoryAvailable: undefined,
                        subCategoryDescription: "",
                        nestedCategory: "",
                        nestedCategoryAvailable: undefined,
                        nestedCategoryDescription: "",
                        nestedCategoryImage: "",
                        price: "",
                        unit: "",
                        numberOfUnits: "",
                        keywords: "",
                        shortDescription: "",
                        numberOfPieces: "",
                        mrpPrice: "",
                        offPercent: "",
                        categoryType: main.categoryType || "product",
                    });
                }
            });
            setRowData(flat);
            setMainCategoryOptionsForSub(mainOptions);
            setMainCategoryOptionsForNested(mainOptionsForNested);
            setSubCategoryOptionsForNested(subOptionsForNested);
        }
    }, [categoriesData]);

    console.log("row data", rowData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const categoryData: any = {
                name: categoryName,
                description: mainCategoryDescription,
                categoryType: categoryType,
            };
            if (mainCategoryImage) {
                categoryData.image = mainCategoryImage;
            }

            await createCategory(categoryData).unwrap();

            setCategoryName("");
            setMainCategoryImage(null);
            setMainCategoryDescription("");
            setCategoryType("product");
            closeModal();

            Swal.fire({
                title: "Success",
                text: "Main category created successfully!",
                icon: "success",
            });
        } catch (error: any) {
            console.error('Error creating category:', error);
            Swal.fire({
                title: "Error",
                text: error?.data?.message || "Failed to create category",
                icon: "error",
            });
        }
    };

    const handleSubCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const categoryData: any = {
                name: subCategoryName,
                description: subCategoryDescription,
                parent: selectedMainCategory,
            };
            if (subCategoryImage) {
                categoryData.image = subCategoryImage;
            }

            await createCategory(categoryData).unwrap();

            setSelectedMainCategory("");
            setSubCategoryName("");
            setSubCategoryImage(null);
            setSubCategoryDescription("");
            closeSubModal();

            Swal.fire({
                title: "Success",
                text: "Sub category created successfully!",
                icon: "success",
            });
        } catch (error: any) {
            console.error('Error creating sub category:', error);
            Swal.fire({
                title: "Error",
                text: error?.data?.message || "Failed to create sub category",
                icon: "error",
            });
        }
    };

    const handleNestedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNestedImage(e.target.files[0]);
        }
    };

    const handleEditClick = (row: any) => {
        setEditData({ ...row });
        setEditSelectOpen(true);
    };

    // Remove showEditForm helper for now

    const handleDeleteClick = (row: any) => {
        setDeleteTarget(row);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteCategory(deleteTarget._id).unwrap();
            setShowDeleteModal(false);
            setDeleteTarget(null);

            Swal.fire({
                title: "Success",
                text: "Category deleted successfully!",
                icon: "success",
            });
        } catch (error: any) {
            console.error('Delete failed:', error);
            Swal.fire({
                title: "Error",
                text: error?.data?.message || "Failed to delete category",
                icon: "error",
            });
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const handleAvailabilityClick = (row: any) => {
        setAvailabilityModal({ open: true, row });
    };

    const handleLevelSelect = (level: 'main' | 'sub' | 'nested') => {
        const row = availabilityModal.row as any;
        let categoryId = '';
        let categoryName = '';
        let available = true;
        if (level === 'main') {
            categoryId = row.mainCategoryId || row._id;
            categoryName = row.mainCategory;
            available = row.mainCategoryAvailable ?? true;
        } else if (level === 'sub') {
            categoryId = row.subCategoryId || row._id;
            categoryName = row.subCategory;
            available = row.subCategoryAvailable ?? true;
        } else if (level === 'nested') {
            categoryId = row.nestedCategoryId || row._id;
            categoryName = row.nestedCategory;
            available = row.nestedCategoryAvailable ?? true;
        }
        setAvailabilityModal({ open: false, row: null });
        setTimeout(() => {
            Swal.fire({
                title: `Are you sure?`,
                text: `Do you want to make '${categoryName}' ${available ? 'unavailable' : 'available'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: `Yes, ${available ? 'make unavailable' : 'make available'}`,
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await updateCategory({ id: categoryId, body: { available: !available } });
                    Swal.fire('Success', `Category '${categoryName}' is now ${!available ? 'available' : 'unavailable'}.`, 'success');
                }
            });
        }, 200);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading categories...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-500">Error loading categories</div>
            </div>
        );
    }

    const handleEditSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        console.log('Update form submitted');
        console.log('editType:', editType);
        console.log('editData:', editData);
        try {
            let categoryData: any = {};
            if (editType === 'main') {
                categoryData = {
                    name: editData.mainCategory,
                    description: editData.mainCategoryDescription,
                    categoryType: editData.mainCategoryType,
                };
                if (editData.mainCategoryImage && typeof editData.mainCategoryImage !== 'string') {
                    categoryData.image = editData.mainCategoryImage;
                }
                console.log('main categoryData:', categoryData);
                const res = await updateCategory({ id: editData.mainCategoryId || editData._id, body: categoryData }).unwrap();
                console.log('updateCategory response:', res);
            } else if (editType === 'sub') {
                categoryData = {
                    name: editData.subCategory,
                    description: editData.subCategoryDescription,
                    parent: editData.mainCategoryId,
                };
                if (editData.subCategoryImage && typeof editData.subCategoryImage !== 'string') {
                    categoryData.image = editData.subCategoryImage;
                }
                console.log('sub categoryData:', categoryData);
                const res = await updateCategory({ id: editData.subCategoryId || editData._id, body: categoryData }).unwrap();
                console.log('updateCategory response:', res);
            } else if (editType === 'nested') {
                categoryData = {
                    name: editData.nestedCategory,
                    description: editData.nestedCategoryDescription,
                    price: (editData?.mrpPrice !== "" || editData?.offPercent !== "")
                        ? String(Math.round(Number(editData?.mrpPrice || 0) - (Number(editData?.mrpPrice || 0) * Number(editData?.offPercent || 0) / 100)))
                        : editData.price,
                    unit: editData.unit,
                    numberOfUnits: editData.numberOfUnits,
                    keywords: editData.keywords,
                    shortDescription: editData.shortDescription,
                    numberOfPieces: editData.numberOfPieces,
                    mrpPrice: editData.mrpPrice,
                    offPercent: editData.offPercent,
                    parent: editData.subCategoryId,
                };
                if (editData.nestedCategoryImage && typeof editData.nestedCategoryImage !== 'string') {
                    categoryData.image = editData.nestedCategoryImage;
                }
                console.log('nested categoryData:', categoryData);
                const res = await updateCategory({ id: editData.nestedCategoryId || editData._id, body: categoryData }).unwrap();
                console.log('updateCategory response:', res);
            }
            setIsEditOpen(false);
            setEditType(null);
            setEditData(null);
            Swal.fire({ title: "Success", text: "Category updated successfully!", icon: "success" });
        } catch (error: any) {
            console.error('updateCategory error:', error);
            Swal.fire({ title: "Error", text: error?.data?.message || "Failed to update category", icon: "error" });
        }
    };

    return (
        <div>
            <PageMeta
                title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
                description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Category" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end sm:items-center sm:gap-2 mb-6">
                    <Button size="sm" variant="primary" onClick={openModal}>
                        Add Main Category
                    </Button>
                    <Button size="sm" variant="primary" onClick={openSubModal}>
                        Add Sub Category
                    </Button>
                    <Button size="sm" variant="primary" onClick={openNestedModal}>
                        Add Nested Category
                    </Button>
                </div>
                <div style={{ height: 500 }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                    />
                </div>
                <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
                    <form className="p-6" onSubmit={handleSubmit}>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Main Category</h2>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-700 dark:text-white">Name</label>
                            <input
                                type="text"
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Enter category name"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-700 dark:text-white">Category Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="categoryType"
                                        value="product"
                                        checked={categoryType === "product"}
                                        onChange={(e) => setCategoryType(e.target.value)}
                                        className="mr-2 text-brand-500 focus:ring-brand-500"
                                    />
                                    <span className="text-gray-700 dark:text-white">Product</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="categoryType"
                                        value="online_mandi"
                                        checked={categoryType === "online_mandi"}
                                        onChange={(e) => setCategoryType(e.target.value)}
                                        className="mr-2 text-brand-500 focus:ring-brand-500"
                                    />
                                    <span className="text-gray-700 dark:text-white">Online Mandi</span>
                                </label>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-700 dark:text-white">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainCategoryImageChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-gray-700 dark:text-white">Description</label>
                            <TextArea
                                value={mainCategoryDescription}
                                onChange={setMainCategoryDescription}
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button size="sm" variant="outline" onClick={closeModal}>Close</Button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </Modal>
                <Modal isOpen={isSubOpen} onClose={closeSubModal} className="max-w-[500px] m-4">
                    <form className="p-6" onSubmit={handleSubCategorySubmit}>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Sub Category</h2>
                        <div className="mb-4">
                            <Label>Main Category</Label>
                            <Select
                                options={mainCategoryOptionsForSub}
                                placeholder="Select Main Category"
                                onChange={setSelectedMainCategory}
                                className="dark:bg-dark-900"
                                defaultValue={selectedMainCategory}
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Name</Label>
                            <InputField
                                value={subCategoryName}
                                onChange={e => setSubCategoryName(e.target.value)}
                                placeholder="Enter sub category name"
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Upload Image</Label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleSubCategoryImageChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Description</Label>
                            <TextArea
                                value={subCategoryDescription}
                                onChange={setSubCategoryDescription}
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button size="sm" variant="outline" onClick={closeSubModal}>Close</Button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </Modal>
                <Modal isOpen={isNestedOpen} onClose={closeNestedModal} className="max-w-[600px] xl:max-w-[1000px] m-4 overflow-y-auto max-h-[90vh]">
                    <form className="p-6" onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const categoryData: any = {
                                name: nestedCategoryName,
                                description: nestedDescription,
                                price: calculatedNestedPrice ? String(calculatedNestedPrice) : nestedPrice,
                                unit: nestedUnit,
                                numberOfUnits: nestedNumberOfUnits,
                                keywords: nestedKeywords,
                                shortDescription: nestedShortDescription,
                                numberOfPieces: nestedNumberOfPieces,
                                mrpPrice: nestedMrpPrice,
                                offPercent: nestedOffPercent,
                                parent: nestedSubCategory,
                            };
                            if (nestedImage) {
                                categoryData.image = nestedImage;
                            }

                            await createCategory(categoryData).unwrap();

                            setNestedMainCategory("");
                            setNestedSubCategory("");
                            setNestedCategoryName("");
                            setNestedImage(null);
                            setNestedDescription("");
                            setNestedPrice("");
                            setNestedUnit("");
                            setNestedNumberOfUnits("");
                            setNestedKeywords("");
                            setNestedShortDescription("");
                            setNestedNumberOfPieces("");
                            setNestedMrpPrice("");
                            setNestedOffPercent("");
                            closeNestedModal();

                            Swal.fire({
                                title: "Success",
                                text: "Nested category created successfully!",
                                icon: "success",
                            });
                        } catch (error: any) {
                            console.error('Error creating nested category:', error);
                            Swal.fire({
                                title: "Error",
                                text: error?.data?.message || "Failed to create nested category",
                                icon: "error",
                            });
                        }
                    }}>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Nested Category</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                            <div>
                                <Label>Main Category</Label>
                                <Select
                                    options={mainCategoryOptionsForNested}
                                    placeholder="Select Main Category"
                                    onChange={value => {
                                        setNestedMainCategory(value);
                                        setNestedSubCategory("");
                                    }}
                                    className="dark:bg-dark-900"
                                    defaultValue={nestedMainCategory}
                                />
                            </div>
                            <div>
                                <Label>Sub Category</Label>
                                <Select
                                    options={
                                        nestedMainCategory && (subCategoryOptionsForNested as Record<string, any[]>)[nestedMainCategory]
                                            ? (subCategoryOptionsForNested as Record<string, any[]>)[nestedMainCategory]
                                            : []
                                    }
                                    placeholder="Select Sub Category"
                                    onChange={setNestedSubCategory}
                                    className="dark:bg-dark-900"
                                    defaultValue={nestedSubCategory}
                                />
                            </div>
                            <div>
                                <Label>Name</Label>
                                <InputField
                                    value={nestedCategoryName}
                                    onChange={e => setNestedCategoryName(e.target.value)}
                                    placeholder="Enter nested category name"
                                />
                            </div>
                            <div>
                                <Label>Upload Image</Label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleNestedImageChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <Label>MRP Price</Label>
                                <InputField
                                    type="number"
                                    value={nestedMrpPrice}
                                    onChange={e => setNestedMrpPrice(e.target.value)}
                                    placeholder="e.g. 1500"
                                />
                            </div>
                            <div>
                                <Label>Off Percent</Label>
                                <InputField
                                    type="number"
                                    value={nestedOffPercent}
                                    onChange={e => setNestedOffPercent(e.target.value)}
                                    placeholder="e.g. 20"
                                />
                            </div>
                            {/* Price field is now conditional and read-only if calculated, and comes after Off Percent */}
                            {(nestedMrpPrice !== "" || nestedOffPercent !== "") ? (
                                <div>
                                    <Label>Price</Label>
                                    <InputField
                                        type="number"
                                        value={calculatedNestedPrice}
                                        onChange={() => { }}
                                        placeholder="Calculated price"
                                        readOnly
                                    />
                                </div>
                            ) : null}
                            <div>
                                <Label>Unit</Label>
                                <Select
                                    options={[
                                        { value: "kg", label: "Kg" },
                                        { value: "pcs", label: "Pcs" },
                                        { value: "gram", label: "Gram" },
                                    ]}
                                    placeholder="Select Unit"
                                    onChange={setNestedUnit}
                                    className="dark:bg-dark-900"
                                    defaultValue={nestedUnit}
                                />
                            </div>
                            {/* New fields start here */}
                            <div>
                                <Label>Number of Units</Label>
                                <InputField
                                    value={nestedNumberOfUnits}
                                    onChange={e => setNestedNumberOfUnits(e.target.value)}
                                    placeholder="e.g. 500g"
                                />
                            </div>
                            <div>
                                <Label>Number of Pieces</Label>
                                <InputField
                                    value={nestedNumberOfPieces}
                                    onChange={e => setNestedNumberOfPieces(e.target.value)}
                                    placeholder="e.g. 500g ma 12 - 18 pieces"
                                />
                            </div>
                            <div>
                                <Label>Keywords</Label>
                                <InputField
                                    value={nestedKeywords}
                                    onChange={e => setNestedKeywords(e.target.value)}
                                    placeholder="e.g. Bone-in, Small Cuts, Curry Cut"
                                />
                            </div>
                            <div>
                                <Label>Short Description</Label>
                                <InputField
                                    value={nestedShortDescription}
                                    onChange={e => setNestedShortDescription(e.target.value)}
                                    placeholder="e.g. Fresh beef chops 500g"
                                />
                            </div>
                            {/* New fields end here */}
                        </div>
                        <div className="mb-4">
                            <Label>Description</Label>
                            <TextArea
                                value={nestedDescription}
                                onChange={setNestedDescription}
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button size="sm" variant="outline" onClick={closeNestedModal}>Close</Button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </Modal>
                {/* Delete Confirmation Modal */}
                <Modal isOpen={showDeleteModal} onClose={handleCancelDelete} className="max-w-[400px] m-4">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Delete Confirmation</h2>
                        <p className="mb-6 text-gray-700 dark:text-gray-200">
                            Are you sure you want to delete {deleteTarget?.nestedCategory ? 'nested category' : deleteTarget?.subCategory ? 'sub category' : 'main category'}?
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={handleCancelDelete}>Cancel</Button>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </Modal>
                {/* Category selection modal */}
                <Modal isOpen={editSelectOpen} onClose={() => setEditSelectOpen(false)} className="max-w-[400px] m-4">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Which category do you want to edit?</h2>
                        <div className="flex flex-col gap-4">
                            <Button onClick={() => { setEditType('main'); setIsEditOpen(true); setEditSelectOpen(false); }}>Main Category</Button>
                            <Button onClick={() => { setEditType('sub'); setIsEditOpen(true); setEditSelectOpen(false); }} disabled={!editData?.subCategory}>Sub Category</Button>
                            <Button onClick={() => { setEditType('nested'); setIsEditOpen(true); setEditSelectOpen(false); }} disabled={!editData?.nestedCategory}>Nested Category</Button>
                        </div>
                    </div>
                </Modal>
                {/* Edit modal */}
                <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} className="max-w-[1000px] m-4">
                    {editType && editData && (
                        <>
                            <form className="p-6" onSubmit={handleEditSubmit}>
                                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Edit {editType === 'main' ? 'Main' : editType === 'sub' ? 'Sub' : 'Nested'} Category</h2>
                                {/* Render fields based on editType, pre-filled with editData */}
                                {/* Example for nested: */}
                                {editType === 'nested' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-4 items-start gap-4 mb-4">
                                        <div>
                                            <Label>Main Category</Label>
                                            <Select
                                                options={mainCategoryOptionsForNested}
                                                placeholder="Select Main Category"
                                                value={editData.mainCategoryId || ""}
                                                onChange={value => setEditData((prev: any) => ({ ...prev, mainCategoryId: value }))}
                                                className="dark:bg-dark-900"
                                            />
                                        </div>
                                        <div>
                                            <Label>Sub Category</Label>
                                            <Select
                                                options={
                                                    editData.mainCategoryId && (subCategoryOptionsForNested as Record<string, any[]>)[editData.mainCategoryId]
                                                        ? (subCategoryOptionsForNested as Record<string, any[]>)[editData.mainCategoryId]
                                                        : []
                                                }
                                                placeholder="Select Sub Category"
                                                value={editData.subCategoryId || ""}
                                                onChange={value => setEditData((prev: any) => ({ ...prev, subCategoryId: value }))}
                                                className="dark:bg-dark-900"
                                            />
                                        </div>
                                        <div>
                                            <Label>Name</Label>
                                            <InputField
                                                value={editData.nestedCategory}
                                                onChange={e => setEditData((prev: any) => ({ ...prev, nestedCategory: e.target.value }))}
                                                placeholder="Enter nested category name"
                                            />
                                        </div>
                                        <div>
                                            <Label>Upload Image</Label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const files = e.target.files;
                                                    if (files && files[0]) {
                                                        setEditData((prev: any) => ({ ...prev, nestedCategoryImage: files[0] }));
                                                    }
                                                }}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            />
                                            {editData.nestedCategoryImage && typeof editData.nestedCategoryImage === 'string' && (
                                                <img src={`${UPLOADS_URL}uploads/${editData.nestedCategoryImage}`} alt="Current" className="mt-2 rounded w-20 h-20 object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <Label>MRP Price</Label>
                                            <InputField
                                                type="number"
                                                value={editData.mrpPrice}
                                                onChange={e => setEditData((prev: any) => {
                                                    const nextMrp = e.target.value;
                                                    const priceComputed = String(
                                                        Math.round(
                                                            Number(nextMrp || 0) - (Number(nextMrp || 0) * Number(prev.offPercent || 0) / 100)
                                                        )
                                                    );
                                                    return { ...prev, mrpPrice: nextMrp, price: priceComputed };
                                                })}
                                                placeholder="e.g. 1500"
                                            />
                                        </div>
                                        <div>
                                            <Label>Off Percent</Label>
                                            <InputField
                                                type="number"
                                                value={editData.offPercent}
                                                onChange={e => setEditData((prev: any) => {
                                                    const nextOff = e.target.value;
                                                    const priceComputed = String(
                                                        Math.round(
                                                            Number(prev.mrpPrice || 0) - (Number(prev.mrpPrice || 0) * Number(nextOff || 0) / 100)
                                                        )
                                                    );
                                                    return { ...prev, offPercent: nextOff, price: priceComputed };
                                                })}
                                                placeholder="e.g. 20"
                                            />
                                        </div>
                                        {/* Price field is now conditional and read-only if calculated, and comes after Off Percent */}
                                        {(editData?.mrpPrice !== "" || editData?.offPercent !== "") ? (
                                            <div>
                                                <Label>Price</Label>
                                                <InputField
                                                    type="number"
                                                    value={calculatedEditPrice}
                                                    onChange={() => { }}
                                                    placeholder="Calculated price"
                                                    readOnly
                                                />
                                            </div>
                                        ) : null}
                                        <div>
                                            <Label>Unit</Label>
                                            <Select
                                                options={[
                                                    { value: "kg", label: "Kg" },
                                                    { value: "pcs", label: "Pcs" },
                                                    { value: "gram", label: "Gram" },
                                                ]}
                                                placeholder="Select Unit"
                                                value={editData.unit || ""}
                                                onChange={value => setEditData((prev: any) => ({ ...prev, unit: value }))}
                                                className="dark:bg-dark-900"
                                            />
                                        </div>
                                        {/* New fields start here */}
                                        <div>
                                            <Label>Number of Units</Label>
                                            <InputField
                                                value={editData.numberOfUnits}
                                                onChange={e => setEditData((prev: any) => ({ ...prev, numberOfUnits: e.target.value }))}
                                                placeholder="e.g. 500g"
                                            />
                                        </div>
                                        <div>
                                            <Label>Number of Pieces</Label>
                                            <InputField
                                                value={editData.numberOfPieces}
                                                onChange={e => setEditData((prev: any) => ({ ...prev, numberOfPieces: e.target.value }))}
                                                placeholder="e.g. 500g ma 12 - 18 pieces"
                                            />
                                        </div>
                                        <div>
                                            <Label>Keywords</Label>
                                            <InputField
                                                value={editData.keywords}
                                                onChange={e => setEditData((prev: any) => ({ ...prev, keywords: e.target.value }))}
                                                placeholder="e.g. Bone-in, Small Cuts, Curry Cut"
                                            />
                                        </div>
                                        <div>
                                            <Label>Short Description</Label>
                                            <InputField
                                                value={editData.shortDescription}
                                                onChange={e => setEditData((prev: any) => ({ ...prev, shortDescription: e.target.value }))}
                                                placeholder="e.g. Fresh beef chops 500g"
                                            />
                                        </div>
                                        {/* New fields end here */}
                                        <div className="mb-4 lg:col-span-2">
                                            <Label>Description</Label>
                                            <TextArea
                                                value={editData.nestedCategoryDescription || ""}
                                                onChange={value => setEditData((prev: any) => ({ ...prev, nestedCategoryDescription: value }))}
                                                placeholder="Enter description"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* Similar for main/sub: use value={editData.field} and onChange to update editData */}
                                {editType === 'main' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label>Name</Label>
                                            <InputField
                                                value={editData.mainCategory}
                                                onChange={e => setEditData((prev: any) => ({ ...prev, mainCategory: e.target.value }))}
                                                placeholder="Enter category name"
                                            />
                                        </div>
                                        <div>
                                            <Label>Category Type</Label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="categoryType"
                                                        value="product"
                                                        checked={editData.mainCategoryType === "product"}
                                                        onChange={e => setEditData((prev: any) => ({ ...prev, mainCategoryType: e.target.value }))}
                                                        className="mr-2 text-brand-500 focus:ring-brand-500"
                                                    />
                                                    <span className="text-gray-700 dark:text-white">Product</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="categoryType"
                                                        value="online_mandi"
                                                        checked={editData.mainCategoryType === "online_mandi"}
                                                        onChange={e => setEditData((prev: any) => ({ ...prev, mainCategoryType: e.target.value }))}
                                                        className="mr-2 text-brand-500 focus:ring-brand-500"
                                                    />
                                                    <span className="text-gray-700 dark:text-white">Online Mandi</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Upload Image</Label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const files = e.target.files;
                                                    if (files && files[0]) {
                                                        setEditData((prev: any) => ({ ...prev, mainCategoryImage: files[0] }));
                                                    }
                                                }}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            />
                                            {editData.mainCategoryImage && typeof editData.mainCategoryImage === 'string' && (
                                                <img src={`${UPLOADS_URL}uploads/${editData.mainCategoryImage}`} alt="Current" className="mt-2 rounded w-20 h-20 object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <TextArea
                                                value={editData.mainCategoryDescription}
                                                onChange={value => setEditData((prev: any) => ({ ...prev, mainCategoryDescription: value }))}
                                                placeholder="Enter description"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}
                                {editType === 'sub' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label>Main Category</Label>
                                            <Select
                                                options={mainCategoryOptionsForSub}
                                                placeholder="Select Main Category"
                                                value={editData.mainCategoryId || ""}
                                                onChange={value => setEditData((prev: any) => ({ ...prev, mainCategoryId: value }))}
                                                className="dark:bg-dark-900"
                                            />
                                        </div>
                                        <div>
                                            <Label>Name</Label>
                                            <InputField
                                                value={editData.subCategory}
                                                onChange={e => setEditData((prev: any) => ({ ...prev, subCategory: e.target.value }))}
                                                placeholder="Enter sub category name"
                                            />
                                        </div>
                                        <div>
                                            <Label>Upload Image</Label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const files = e.target.files;
                                                    if (files && files[0]) {
                                                        setEditData((prev: any) => ({ ...prev, subCategoryImage: files[0] }));
                                                    }
                                                }}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 dark:bg-gray-900 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            />
                                            {editData.subCategoryImage && typeof editData.subCategoryImage === 'string' && (
                                                <img src={`${UPLOADS_URL}uploads/${editData.subCategoryImage}`} alt="Current" className="mt-2 rounded w-20 h-20 object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <TextArea
                                                value={editData.subCategoryDescription}
                                                onChange={value => setEditData((prev: any) => ({ ...prev, subCategoryDescription: value }))}
                                                placeholder="Enter description"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-dark-900 z-10 px-6 py-4 flex justify-end gap-2 border-t">
                                <Button size="sm" variant="outline" onClick={() => { setIsEditOpen(false); setEditType(null); setEditData(null); }}>Close</Button>
                                <button
                                    type="submit"
                                    onClick={() => handleEditSubmit()}
                                    disabled={isUpdating}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdating ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <span>Update</span>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            </div>
            {/* Image Popup Modal */}
            <Modal isOpen={!!selectedImageUrl} onClose={() => setSelectedImageUrl(null)} className="max-w-[420px] max-h-[420px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center p-2">
                    {selectedImageUrl && (
                        <img src={selectedImageUrl} alt="Popup" style={{ width: 400, height: 400, objectFit: 'cover', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }} />
                    )}
                </div>
            </Modal>
            {availabilityModal.open && availabilityModal.row && (() => {
                const row = availabilityModal.row as any;
                return (
                    <Modal isOpen={availabilityModal.open} onClose={() => setAvailabilityModal({ open: false, row: null })} className="max-w-[400px] m-4">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Select Category Level</h2>
                            <div className="flex flex-col gap-4">
                                {/* Main Category */}
                                {row.mainCategory && (
                                    <Button
                                        onClick={() => handleLevelSelect('main')}
                                        className="flex items-center justify-between px-6 py-3 rounded-xl  shadow border border-gray-200 hover:bg-blue-50 transition text-lg font-semibold"
                                    >
                                        <span className="truncate">{row.mainCategory}</span>
                                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${(
                                            typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available
                                        ) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {(typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available)
                                                ? 'Available'
                                                : 'Unavailable'}
                                        </span>
                                    </Button>
                                )}

                                {/* Sub Category */}
                                {row.subCategory ? (
                                    <div className="flex flex-col">
                                        <Button
                                            onClick={() => handleLevelSelect('sub')}
                                            disabled={!(typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available)}
                                            className={`flex items-center justify-between px-6 py-3 rounded-xl border text-lg font-semibold transition
                                              ${!(typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available)
                                                    ? 'bg-gray bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : ' shadow border-gray-200 hover:bg-blue-50'}
                                            `}
                                        >
                                            <span className="truncate">{row.subCategory}</span>
                                            <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${(
                                                typeof row.subCategoryAvailable === 'boolean' ? row.subCategoryAvailable : row.available
                                            ) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {(typeof row.subCategoryAvailable === 'boolean' ? row.subCategoryAvailable : row.available)
                                                    ? 'Available'
                                                    : 'Unavailable'}
                                            </span>
                                        </Button>
                                        {!(typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available) && (
                                            <span className="text-xs text-gray-400 ml-2 mt-1">Enable main category first</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center px-6 py-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-400 text-sm">
                                        No subcategory
                                    </div>
                                )}

                                {/* Nested Category */}
                                {row.nestedCategory ? (
                                    <div className="flex flex-col">
                                        <Button
                                            onClick={() => handleLevelSelect('nested')}
                                            disabled={
                                                !(typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available) ||
                                                !(typeof row.subCategoryAvailable === 'boolean' ? row.subCategoryAvailable : row.available)
                                            }
                                            className={`flex items-center justify-between px-6 py-3 rounded-xl border text-lg font-semibold transition
                                              ${(
                                                    !(typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available) ||
                                                    !(typeof row.subCategoryAvailable === 'boolean' ? row.subCategoryAvailable : row.available)
                                                )
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'shadow border-gray-200 hover:bg-blue-50'}
                                            `}
                                        >
                                            <span className="truncate">{row.nestedCategory}</span>
                                            <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${(
                                                typeof row.nestedCategoryAvailable === 'boolean' ? row.nestedCategoryAvailable : row.available
                                            ) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {(typeof row.nestedCategoryAvailable === 'boolean' ? row.nestedCategoryAvailable : row.available)
                                                    ? 'Available'
                                                    : 'Unavailable'}
                                            </span>
                                        </Button>
                                        {(
                                            !(typeof row.mainCategoryAvailable === 'boolean' ? row.mainCategoryAvailable : row.available) ||
                                            !(typeof row.subCategoryAvailable === 'boolean' ? row.subCategoryAvailable : row.available)
                                        ) && (
                                                <span className="text-xs text-gray-400 ml-2 mt-1">Enable parent category first</span>
                                            )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center px-6 py-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-400 text-sm">
                                        No nested category
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal>
                );
            })()}
        </div>
    );
}
