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
import TrashIcon from "../../icons/trash.svg";
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from "../../redux/services/categoriesSlice";
import Swal from "sweetalert2";
import { UPLOADS_URL } from "../../constants/api";

const ActionsCellRenderer = (props: any) => (
  <div className="flex gap-2">
    <button
      onClick={() => props.onDelete(props.data)}
      className="text-red-500 hover:text-red-700 p-1"
      title="Delete"
    >
      <img src={TrashIcon} alt="Delete" className="w-5 h-5 inline-block" />
    </button>
    <button
      onClick={() => props.onAvailability(props.data)}
      className="text-blue-500 hover:text-blue-700 p-1"
      title="Toggle Availability"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
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
    const [updateCategory] = useUpdateCategoryMutation();
    console.log(UPLOADS_URL);
    
    // Column Definitions: Defines the columns to be displayed.
    const [colDefs] = useState<any>([
        {
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params: any) => (
                <ActionsCellRenderer
                    data={params.data}
                    onDelete={handleDeleteClick}
                    onAvailability={handleAvailabilityClick}
                />
            ),
            width: 120,
            filter: false,
            sortable: false,
        },
        {
            field: "mainCategory",
            headerName: "Main Category",
            filter: 'agTextColumnFilter',
            cellRenderer: (params: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {params.data && params.data.mainCategoryImage ? (
                        <img
                            src={`${UPLOADS_URL}Uploads/${params.data.mainCategoryImage}`}
                            alt="img"
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                            onClick={() => setSelectedImageUrl(`${UPLOADS_URL}Uploads/${params.data.mainCategoryImage}`)}
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
                            src={`${UPLOADS_URL}Uploads/${params.data.subCategoryImage}`}
                            alt="img"
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                            onClick={() => setSelectedImageUrl(`${UPLOADS_URL}Uploads/${params.data.subCategoryImage}`)}
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
                    {params.data && params.data.image ? (
                        <img
                            src={`${UPLOADS_URL}Uploads/${params.data.image}`}
                            alt="img"
                            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                            onClick={() => setSelectedImageUrl(`${UPLOADS_URL}Uploads/${params.data.image}`)}
                        />
                    ) : null}
                    <span>{params.value}</span>
                </div>
            )
        },
        { field: "description", headerName: "Description", filter: false },
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
                <ActionsCellRenderer data={params.data} onDelete={handleDeleteClick} onAvailability={handleAvailabilityClick} />
            ),
            width: 100,
            filter: false,
            sortable: false,
        },
    ]);

    const { isOpen, openModal, closeModal } = useModal();
    const [categoryName, setCategoryName] = useState("");

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
    const calculatedNestedPrice = nestedMrpPrice && nestedOffPercent
        ? Math.round(Number(nestedMrpPrice) - (Number(nestedMrpPrice) * Number(nestedOffPercent) / 100))
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
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

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
                                    subCategory: sub.name,
                                    subCategoryImage: sub.image || "",
                                    subCategoryAvailable: typeof sub.available === 'boolean' ? sub.available : false,
                                    nestedCategory: nested.name,
                                    nestedCategoryAvailable: typeof nested.available === 'boolean' ? nested.available : false,
                                    image: nested.image,
                                    description: nested.description,
                                    price: nested.price || "",
                                    unit: nested.unit || "",
                                    // New fields for nested categories
                                    numberOfUnits: nested.numberOfUnits || "",
                                    keywords: nested.keywords || "",
                                    shortDescription: nested.shortDescription || "",
                                    numberOfPieces: nested.numberOfPieces || "",
                                    mrpPrice: nested.mrpPrice || "",
                                    offPercent: nested.offPercent || "",
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
                                subCategory: sub.name,
                                subCategoryImage: sub.image || "",
                                subCategoryAvailable: typeof sub.available === 'boolean' ? sub.available : false,
                                nestedCategory: "",
                                nestedCategoryAvailable: undefined,
                                image: "",
                                description: "",
                                price: "",
                                unit: "",
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
                        subCategory: "",
                        subCategoryImage: "",
                        subCategoryAvailable: undefined,
                        nestedCategory: "",
                        nestedCategoryAvailable: undefined,
                        image: "",
                        description: "",
                        price: "",
                        unit: "",
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
            };
            if (mainCategoryImage) {
                categoryData.image = mainCategoryImage;
            }
            
            await createCategory(categoryData).unwrap();
            
            setCategoryName("");
            setMainCategoryImage(null);
            setMainCategoryDescription("");
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
        setSelectedLevel(null);
        setSelectedCategory(null);
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
        setSelectedLevel(level);
        setSelectedCategory({ id: categoryId, name: categoryName, available });
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
                        <h2 className="text-xl font-semibold mb-4">Add Main Category</h2>
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
                        <h2 className="text-xl font-semibold mb-4">Add Sub Category</h2>
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
                <Modal isOpen={isNestedOpen} onClose={closeNestedModal} className="max-w-[600px] xl:max-w-[1000px] m-4">
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
                        <h2 className="text-xl font-semibold mb-4">Add Nested Category</h2>
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
                            {nestedMrpPrice && nestedOffPercent ? (
                                <div>
                                    <Label>Price</Label>
                                    <InputField
                                        type="number"
                                        value={calculatedNestedPrice}
                                        onChange={() => {}}
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
                        <h2 className="text-xl font-semibold mb-4">Delete Confirmation</h2>
                        <p className="mb-6">
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
                            <h2 className="text-lg font-semibold mb-4">Select Category Level</h2>
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
