"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

// Definisikan tipe data yang lebih ketat untuk item
type Item = ({
  _id: Id<"products">;
  productId: string;
  stock: number;
} | {
  _id: Id<"services">;
  serviceId: string;
  stock?: undefined;
}) & {
  name: string;
  price: number;
};

type FormData = {
  id: Id<"products" | "services"> | null;
  type: "product" | "service";
  name: string;
  price: string;
  stock: string;
};

export function ProdukJasa() {
  const [activeTab, setActiveTab] = useState<"product" | "service">("product");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    id: null,
    type: "product",
    name: "",
    price: "",
    stock: "",
  });

  // Mengambil data dari Convex
  const products = useQuery(api.items.listProducts) || [];
  const services = useQuery(api.items.listServices) || [];

  // PERBAIKAN: Memanggil mutation yang spesifik
  const addItem = useMutation(api.items.addItem);
  const updateProduct = useMutation(api.items.updateProduct);
  const updateService = useMutation(api.items.updateService);
  const deleteProduct = useMutation(api.items.deleteProduct);
  const deleteService = useMutation(api.items.deleteService);

  const openModalForNew = () => {
    setIsEditing(false);
    setFormData({ id: null, type: activeTab, name: "", price: "", stock: "" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (item: Item) => {
    setIsEditing(true);
    setFormData({
      id: item._id,
      type: item.stock !== undefined ? "product" : "service",
      name: item.name,
      price: item.price.toString(),
      stock: item.stock?.toString() || "",
    });
    setIsModalOpen(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        // PERBAIKAN: Logika cerdas untuk memanggil mutation yang tepat
        if (formData.type === 'product') {
          await updateProduct({
            id: formData.id as Id<"products">,
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0,
          });
        } else {
          await updateService({
            id: formData.id as Id<"services">,
            name: formData.name,
            price: parseFloat(formData.price),
          });
        }
        toast.success("Item berhasil diperbarui!");
      } else {
        await addItem({
          type: formData.type,
          name: formData.name,
          price: parseFloat(formData.price),
          stock: formData.type === 'product' ? parseInt(formData.stock) || 0 : undefined,
        });
        toast.success("Item berhasil ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} item.`);
      console.error(error);
    }
  };

  const handleDelete = async (item: Item) => {
    if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        // PERBAIKAN: Logika cerdas untuk memanggil mutation delete yang tepat
        if ('productId' in item) { // Cek apakah ini produk
          await deleteProduct({ id: item._id as Id<"products"> });
        } else {
          await deleteService({ id: item._id as Id<"services"> });
        }
        toast.success("Item berhasil dihapus!");
      } catch (error) {
        toast.error("Gagal menghapus item.");
        console.error(error);
      }
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  
  const renderTable = (type: "product" | "service") => {
    const items = type === 'product' ? products : services;
    const headers = type === 'product' ? ["ID", "Nama Produk", "Harga", "Stok", "Aksi"] : ["ID", "Nama Layanan", "Harga", "Aksi"];
    
    return (
     <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              // PERBAIKAN: Menambahkan class hover:bg-gray-50 pada <tr>
              <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                {/* PERBAIKAN: Styling teks dibuat konsisten */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {type === 'product' ? (item as any).productId : (item as any).serviceId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(item.price)}</td>
                {type === 'product' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${(item as any).stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {(item as any).stock}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button onClick={() => openModalForEdit(item as any)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => handleDelete(item as any)} className="text-red-600 hover:text-red-900">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {/* ... Header ... */}
			 <div className="bg-white rounded-[16px] shadow-sm p-6 mb-[40px]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kelola Produk & Jasa</h2>
            <p className="text-gray-600">Lihat dan kelola Semua Produk dan Jasa</p>
          </div>
					<button onClick={openModalForNew} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <i className="fas fa-plus"></i> + Tambah Item
        </button>
        </div>
      </div>
			
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex gap-x-6" aria-label="Tabs">
          <button onClick={() => setActiveTab("product")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'product' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Produk / Suku Cadang
          </button>
          <button onClick={() => setActiveTab("service")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'service' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Jasa / Layanan
          </button>
        </nav>
      </div>

      <div className="bg-white overflow-hidden">
        {renderTable(activeTab)}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Item' : 'Tambah Item Baru'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe Item</label>
                  <select name="type" value={formData.type} onChange={handleFormChange} disabled={isEditing} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100">
                    <option value="product">Produk</option>
                    <option value="service">Jasa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Item</label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Harga</label>
                  <input type="number" name="price" value={formData.price} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                {formData.type === 'product' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isEditing ? 'Simpan Perubahan' : 'Tambahkan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}