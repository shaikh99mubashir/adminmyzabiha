import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import InputField from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import TextArea from "../../../components/form/input/TextArea";
import { useGetCategoriesQuery } from "../../../redux/services/categoriesSlice";
import { useCreateOrderMutation, useUpdateOrderMutation, useGetOrderByIdQuery } from "../../../redux/services/ordersSlice";

const Order: React.FC = () => {
  // All hooks at the top level
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { data: orderData, isLoading: isOrderLoading } = useGetOrderByIdQuery(id, { skip: !isEditMode });
  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    items: [],
    paymentMethod: "",
    delivery: false,
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    paymentStatus: "pending",
    status: "pending",
  });
  const [selectedItems, setSelectedItems] = useState<Array<{id: string, qty: number, name: string, price: number, category: any}>>([]);

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && orderData && categoriesData) {
      setFormData({
        customerName: orderData.customerName || "",
        customerEmail: orderData.customerEmail || "",
        customerPhone: orderData.customerPhone || "",
        address: orderData.address || "",
        paymentMethod: orderData.paymentMethod || "",
        delivery: orderData.delivery || false,
        subtotal: orderData.subtotal || 0,
        shippingFee: orderData.shipping || 0,
        total: orderData.orderTotalPrice || 0,
        items: [],
        paymentStatus: orderData.paymentStatus || "pending",
        status: orderData.status || "pending",
      });
      // Items mapping (rehydrate category from categoriesData)
      const itemsWithDetails = (orderData.items || [])
        .map((item: any) => {
          // Find the full category object from categoriesData
          let foundCategory: any = null;
          if (categoriesData) {
            categoriesData.forEach((main: any) => {
              if (main.subCategories) {
                main.subCategories.forEach((sub: any) => {
                  if (sub.nestedCategories) {
                    sub.nestedCategories.forEach((nested: any) => {
                      if (nested._id === (item.id || item.category)) {
                        foundCategory = nested;
                      }
                    });
                  }
                });
              }
            });
          }
          return {
            id: item.id || item.category,
            qty: item.qty || item.quantity,
            name: foundCategory ? foundCategory.name : '',
            price: foundCategory ? foundCategory.price : 0,
            category: foundCategory,
          };
        })
        .filter((item: any) => item.category); // Only keep items with a valid category
      setSelectedItems(itemsWithDetails);
    }
  }, [isEditMode, orderData, categoriesData]);

  // Get all nested categories for selection
  const getNestedCategories = () => {
    if (!categoriesData) return [];
    const nestedCategories: Array<{value: string, label: string, price: number}> = [];
    categoriesData.forEach((main: any) => {
      if (main.subCategories) {
        main.subCategories.forEach((sub: any) => {
          if (sub.nestedCategories) {
            sub.nestedCategories.forEach((nested: any) => {
              nestedCategories.push({
                value: nested._id,
                label: `${main.name} > ${sub.name} > ${nested.name}`,
                price: nested.price || 0
              });
            });
          }
        });
      }
    });
    return nestedCategories;
  };

  const handleAddItem = (categoryId: string) => {
    // Find the full category object from categoriesData
    let foundCategory = null;
    if (categoriesData) {
      categoriesData.forEach((main: any) => {
        if (main.subCategories) {
          main.subCategories.forEach((sub: any) => {
            if (sub.nestedCategories) {
              sub.nestedCategories.forEach((nested: any) => {
                if (nested._id === categoryId) {
                  foundCategory = nested;
                }
              });
            }
          });
        }
      });
    }
    const category = getNestedCategories().find(cat => cat.value === categoryId);
    if (category && !selectedItems.find(item => item.id === categoryId)) {
      setSelectedItems([...selectedItems, {
        id: categoryId,
        qty: 1,
        name: category.label,
        price: category.price,
        category: foundCategory || { _id: categoryId, name: category.label, price: category.price },
      }]);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === itemId ? { ...item, qty: newQty } : item
    ));
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderData = {
      customer: {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
        address: formData.address
      },
      items: selectedItems
        .filter(item => item.category && item.qty)
        .map(item => ({
          id: item.category._id,
          qty: item.qty
        })),
      shippingMethod: formData.delivery ? "delivery" : "pickup",
      paymentMethod: formData.paymentMethod,
      subtotal: selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0),
      shippingFee: formData.delivery ? 10 : 0,
      total: selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0) + (formData.delivery ? 10 : 0),
      paymentStatus: formData.paymentStatus,
      status: formData.status,
    };
    try {
      if (isEditMode) {
        await updateOrder({ id: id!, orderData }).unwrap();
        navigate("/order-list");
      } else {
        await createOrder(orderData).unwrap();
        navigate("/order-list");
      }
    } catch (error) {
      alert('Error creating order. Please try again.');
    }
  };

  // Loading/Error UI for edit mode (after all hooks)
  if (isEditMode && isOrderLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (isEditMode && !orderData) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Order not found.</div>;
  }

  return (
    <div>
      <PageMeta
        title={isEditMode ? "Edit Order | MyZabiha Admin" : "Create Order | MyZabiha Admin"}
        description={isEditMode ? "Edit existing customer order" : "Create a new customer order"}
      />
      <PageBreadcrumb 
        pageTitle={isEditMode ? "Edit Order" : "Create Order"} 
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Order List", path: "/order-list" },
          { label: isEditMode ? "Edit Order" : "Create Order" }
        ]}
      />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditMode ? `Edit Order #${orderData?.orderNumber || id}` : "Create New Order"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEditMode 
              ? "Update the order details below" 
              : "Fill in the details to create a new customer order"
            }
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer Name</Label>
                <InputField
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <InputField
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <InputField
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Address</Label>
                <TextArea
                  value={formData.address}
                  onChange={(value) => setFormData({...formData, address: value})}
                  placeholder="Enter delivery address"
                  rows={3}
                />
              </div>
            </div>
          </div>
          {/* Order Items */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            {/* Add Item */}
            <div className="mb-4">
              <Label>Add Item</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    options={getNestedCategories()}
                    placeholder="Select nested category"
                    onChange={handleAddItem}
                    className="dark:bg-gray-900"
                  />
                </div>
              </div>
            </div>
            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Items</Label>
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-700 rounded border">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">RS{item.price} per unit</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Qty:</Label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="font-medium">RS{item.price * item.qty}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Order Summary */}
            {selectedItems.length > 0 && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded border">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>RS{selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee:</span>
                    <span>RS{formData.delivery ? 10 : 0}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total:</span>
                    <span>RS{selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0) + (formData.delivery ? 10 : 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Order Details */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment Method</Label>
                <Select
                  options={[
                    { value: "cod", label: "Cash on Delivery" },
                    { value: "card", label: "Card Payment" },
                    { value: "upi", label: "UPI" },
                  ]}
                  placeholder="Select payment method"
                  onChange={(value) => setFormData({...formData, paymentMethod: value})}
                  className="dark:bg-gray-900"
                />
              </div>
              <div>
                <Label>Delivery Type</Label>
                <Select
                  options={[
                    { value: "home", label: "Home Delivery" },
                    { value: "pickup", label: "Pickup" },
                  ]}
                  placeholder="Select delivery type"
                  onChange={(value) => setFormData({...formData, delivery: value === "home"})}
                  className="dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Order Meta (read-only fields) */}
          {isEditMode && (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Order Meta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Payment Status</Label>
                  <Select
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "paid", label: "Paid" },
                      { value: "failed", label: "Failed" },
                    ]}
                    defaultValue={formData.paymentStatus}
                    onChange={value => setFormData({ ...formData, paymentStatus: value })}
                    className="dark:bg-gray-900"
                  />
                </div>
                <div>
                  <Label>Order Status</Label>
                  <Select
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "confirmed", label: "Confirmed" },
                      { value: "processing", label: "Processing" },
                      { value: "shipped", label: "Shipped" },
                      { value: "delivered", label: "Delivered" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                    defaultValue={formData.status}
                    onChange={value => setFormData({ ...formData, status: value })}
                    className="dark:bg-gray-900"
                  />
                </div>
                <div>
                  <Label>Subtotal</Label>
                  <InputField value={orderData?.subtotal || ""} disabled />
                </div>
                <div>
                  <Label>Shipping Fee</Label>
                  <InputField value={orderData?.shipping || ""} disabled />
                </div>
                <div>
                  <Label>Total</Label>
                  <InputField value={orderData?.orderTotalPrice || ""} disabled />
                </div>
                <div>
                  <Label>Created At</Label>
                  <InputField value={orderData?.createdAt ? new Date(orderData.createdAt).toLocaleString() : ""} disabled />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button size="md" variant="outline" onClick={() => navigate("/order-list")}>Cancel</Button>
            <button 
              type="submit" 
              disabled={isCreating || isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? "Processing..." : (isEditMode ? "Update Order" : "Create Order")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Order;

