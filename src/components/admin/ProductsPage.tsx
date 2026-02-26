import React, { useMemo, useState } from 'react';
import { useProductStore, useToastStore } from '../../store';
import { Icons } from '../ui/Icons';
import Modal from '../common/Modal';
import EmptyState from '../common/EmptyState';
import { cn } from '../../utils/helpers';
import type { Product } from '../../types';

const defaultProduct: Omit<Product, 'id'> = {
  code: '',
  name: '',
};

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query));
  }, [products, search]);

  function openCreate() {
    setEditingProduct(null);
    setForm(defaultProduct);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({ code: product.code, name: product.name });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const normalizedCode = form.code.trim().toLowerCase();
    const isDuplicate = products.some((p) => p.code === normalizedCode && p.id !== editingProduct?.id);

    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!normalizedCode) nextErrors.code = 'Code is required';
    if (isDuplicate) nextErrors.code = 'Code must be unique';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const payload = { name: form.name.trim(), code: form.code.trim().toLowerCase() };
    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      addToast({ type: 'success', title: 'Product updated' });
    } else {
      addProduct(payload);
      addToast({ type: 'success', title: 'Product created' });
    }
    setModalOpen(false);
  }

  function handleDelete(product: Product) {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    deleteProduct(product.id);
    addToast({ type: 'info', title: 'Product deleted' });
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Products</h1>
          <p className="text-sm text-surface-500 mt-1">{products.length} configured products</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Icons.Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative max-w-xs">
        <Icons.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icons.Fuel size={48} />}
          title="No products found"
          action={<button onClick={openCreate} className="btn-primary btn-sm"><Icons.Plus size={14} /> Add Product</button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Code</th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium text-surface-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 font-mono">{product.code}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="btn-ghost btn-sm" title="Edit">
                          <Icons.Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(product)} className="btn-ghost btn-sm text-danger-600" title="Delete">
                          <Icons.Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className={cn('input-field', errors.name && 'border-danger-500')}
              placeholder="Diesel"
            />
            {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toLowerCase().trim() }))}
              className={cn('input-field', errors.code && 'border-danger-500')}
              placeholder="diesel"
            />
            {errors.code && <p className="text-xs text-danger-600 mt-1">{errors.code}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

