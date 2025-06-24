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

const DeleteButtonRenderer = (props: any) => (
  <button
    onClick={() => props.onDelete(props.data)}
    className="text-red-500 hover:text-red-700 p-1"
    title="Delete"
  >
    <img src={TrashIcon} alt="Delete" className="w-5 h-5 inline-block" />
  </button>
);

export default function Category() {
    const [rowData, setRowData] = useState<any[]>([]);
    console.log("row data", rowData);
    
    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState<any>([
        { field: "mainCategory", headerName: "Main Category", filter: 'agTextColumnFilter' },
        { field: "subCategory", headerName: "Sub Category", filter: 'agTextColumnFilter' },
        { field: "nestedCategory", headerName: "Nested Category", filter: 'agTextColumnFilter' },
        { field: "image", headerName: "Image", filter: 'agTextColumnFilter',
          cellRenderer: (params: any) => (
            params.value
              ? <img src={`http://localhost:3050/Uploads/${params.value}`} alt="img" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
              : "-"
          )
        },
        { field: "description", headerName: "Description", filter: 'agTextColumnFilter' },
        { field: "price", headerName: "Price", filter: 'agNumberColumnFilter', valueFormatter: (params: any) => (params.value === undefined || params.value === null || params.value === '' || isNaN(Number(params.value))) ? '-' : params.value },
        { field: "unit", headerName: "Unit", filter: 'agTextColumnFilter' },
        {
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params: any) => (
                <DeleteButtonRenderer data={params.data} onDelete={handleDeleteClick} />
            ),
            width: 80,
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

    // Main categories for select (using make as value/label for demo)
    const mainCategoryOptions = rowData.map(item => ({ value: item.make, label: item.make }));

    // Nested Category Modal State
    const { isOpen: isNestedOpen, openModal: openNestedModal, closeModal: closeNestedModal } = useModal();
    const [nestedMainCategory, setNestedMainCategory] = useState("");
    const [nestedSubCategory, setNestedSubCategory] = useState("");
    const [nestedCategoryName, setNestedCategoryName] = useState("");
    const [nestedImage, setNestedImage] = useState<File | null>(null);
    const [nestedDescription, setNestedDescription] = useState("");
    const [nestedPrice, setNestedPrice] = useState("");
    const [nestedUnit, setNestedUnit] = useState("");

    // For demo: sub categories by main category
    const subCategoriesByMain: { [key: string]: string[] } = {
        Tesla: ["Model Y", "Model X"],
        Ford: ["F-Series", "Mustang"],
        Toyota: ["Corolla", "Camry"],
    };
    const nestedSubCategoryOptions = subCategoriesByMain[nestedMainCategory] || [];

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

    // Fetch categories and set options/data
    const fetchCategories = () => {
        fetch("http://localhost:3050/v1/categories")
            .then(res => res.json())
            .then((data) => {
                // Map data so each row is a chain: main, sub, nested (side by side)
                const flat: any[] = [];
                const mainOptions: any[] = [];
                const mainOptionsForNested: any[] = [];
                const subOptionsForNested: Record<string, any[]> = {};
                data.forEach((main: any) => {
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
                                        mainCategory: main.name,
                                        subCategory: sub.name,
                                        nestedCategory: nested.name,
                                        image: nested.image,
                                        description: nested.description,
                                        price: nested.price || "",
                                        unit: nested.unit || "",
                                    });
                                });
                            } else {
                                flat.push({
                                    _id: sub._id,
                                    mainCategory: main.name,
                                    subCategory: sub.name,
                                    nestedCategory: "",
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
                            mainCategory: main.name,
                            subCategory: "",
                            nestedCategory: "",
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
            });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', categoryName);
        formData.append('description', mainCategoryDescription);
        if (mainCategoryImage) {
            formData.append('image', mainCategoryImage);
        }
        try {
            const response = await fetch('http://localhost:3050/v1/categories', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Failed to submit category');
            }
            setCategoryName("");
            setMainCategoryImage(null);
            setMainCategoryDescription("");
            closeModal();
            fetchCategories(); // reload table
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const handleSubCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', subCategoryName);
        formData.append('description', subCategoryDescription);
        if (subCategoryImage) {
            formData.append('image', subCategoryImage);
        }
        if (selectedMainCategory) {
            formData.append('parent', selectedMainCategory);
        }
        try {
            const response = await fetch('http://localhost:3050/v1/categories', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Failed to submit sub category');
            }
            setSelectedMainCategory("");
            setSubCategoryName("");
            setSubCategoryImage(null);
            setSubCategoryDescription("");
            closeSubModal();
            fetchCategories(); // reload table
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const handleNestedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNestedImage(e.target.files[0]);
        }
    };

    const handleNestedCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            mainCategory: nestedMainCategory,
            subCategory: nestedSubCategory,
            name: nestedCategoryName,
            image: nestedImage,
            description: nestedDescription,
            price: nestedPrice,
            unit: nestedUnit,
        });
        setNestedMainCategory("");
        setNestedSubCategory("");
        setNestedCategoryName("");
        setNestedImage(null);
        setNestedDescription("");
        setNestedPrice("");
        setNestedUnit("");
        closeNestedModal();
    };

    const handleDeleteClick = (row: any) => {
        setDeleteTarget(row);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        console.log('Deleting:', deleteTarget);
        try {
            const res = await fetch(`http://localhost:3050/v1/categories/${deleteTarget._id}`, { method: 'DELETE' });
            console.log('Delete response:', res.status, await res.text());
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchCategories();
        } catch (e) {
            alert('Delete failed');
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
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
                    <div style={{ width: 60, height: 60, border: '1px solid #ccc', marginLeft: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src="http://localhost:3050/Uploads/1750771985101-151689404.png"
                            alt="Test"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
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
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600">Submit</button>
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
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600">Submit</button>
                        </div>
                    </form>
                </Modal>
                <Modal isOpen={isNestedOpen} onClose={closeNestedModal} className="max-w-[600px] m-4">
                    <form className="p-6" onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData();
                        formData.append('name', nestedCategoryName);
                        formData.append('description', nestedDescription);
                        formData.append('price', nestedPrice);
                        formData.append('unit', nestedUnit);
                        if (nestedImage) {
                            formData.append('image', nestedImage);
                        }
                        if (nestedSubCategory) {
                            formData.append('parent', nestedSubCategory);
                        }
                        try {
                            const response = await fetch('http://localhost:3050/v1/categories', {
                                method: 'POST',
                                body: formData,
                            });
                            if (!response.ok) {
                                throw new Error('Failed to submit nested category');
                            }
                            setNestedMainCategory("");
                            setNestedSubCategory("");
                            setNestedCategoryName("");
                            setNestedImage(null);
                            setNestedDescription("");
                            setNestedPrice("");
                            setNestedUnit("");
                            closeNestedModal();
                            fetchCategories(); // reload table
                        } catch (error: any) {
                            alert('Error: ' + error.message);
                        }
                    }}>
                        <h2 className="text-xl font-semibold mb-4">Add Nested Category</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
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
                                <Label>Price</Label>
                                <InputField
                                    type="number"
                                    value={nestedPrice}
                                    onChange={e => setNestedPrice(e.target.value)}
                                    placeholder="Enter price"
                                />
                            </div>
                            <div>
                                <Label>Unit</Label>
                                <Select
                                    options={[
                                        { value: "per_kg", label: "Per Kg" },
                                        { value: "per_pcs", label: "Per Pcs" },
                                    ]}
                                    placeholder="Select Unit"
                                    onChange={setNestedUnit}
                                    className="dark:bg-dark-900"
                                    defaultValue={nestedUnit}
                                />
                            </div>
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
                            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600">Submit</button>
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
                            <Button size="sm" variant="primary" onClick={handleConfirmDelete}>Delete</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
