import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getProducts, updateProduct, getUniqueLocations } from '@/data/store';
import type { Product } from '@/types';
import { formatCurrency, getNextProductId } from '@/lib/utils';
import { Plus, Edit3, Check, X, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

export default function Administrar() {
  const { toggleProductStatus, showToast } = useApp();
  const products = getProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const locations = useMemo(() => getUniqueLocations(), []);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find(p => p.id === e.target.value);
    setSelectedProduct(product || null);
  };

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValues({ [field]: value });
  };

  const saveEdit = (field: string) => {
    if (!selectedProduct) return;
    const val = editValues[field];
    if (val === undefined || val === '') return;

    const updates: Partial<Product> = {};
    if (field === 'cost') updates.cost = Number(val);
    if (field === 'price') updates.price = Number(val);
    if (field === 'stock') updates.stock = Number(val);
    if (field === 'location') updates.location = val;

    updateProduct(selectedProduct.id, updates);
    setSelectedProduct({ ...selectedProduct, ...updates });
    setEditingField(null);
    showToast('Cambio guardado', 'success');
  };

  const handleToggleStatus = () => {
    if (!selectedProduct) return;
    const result = toggleProductStatus(selectedProduct.id);
    if (result) setSelectedProduct(result);
  };

  if (!selectedProduct && products.length > 0) {
    setSelectedProduct(products[0]);
  }

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-[24px] font-bold text-[#1A1A1A]">Administrar</h1>
        <select
          value={selectedProduct?.id || ''}
          onChange={handleProductSelect}
          className="w-[400px] h-[40px] px-3 border border-[#D0D0D0] rounded-lg text-[14px] text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none appearance-none bg-white cursor-pointer"
        >
          <option value="">Seleccionar producto...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.productId} - {p.name} {p.status ? '' : '(Inactivo)'}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 h-[36px] bg-[#1A1A1A] text-white text-[14px] font-medium rounded-lg hover:bg-[#333] transition-colors"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      {selectedProduct && (
        <>
          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden mb-5">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E5E5E5]">
                  <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3">id_producto</th>
                  <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3">Producto</th>
                  <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3">Costo</th>
                  <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3">Precio</th>
                  <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3">Stock</th>
                  <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3">Ubicación</th>
                  <th className="text-center text-[12px] uppercase text-[#666] font-medium px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-[14px] text-[#1A1A1A] font-mono">{selectedProduct.productId}</td>
                  <td className="px-4 py-3 text-[14px] text-[#1A1A1A]">{selectedProduct.name}</td>
                  <td className="px-4 py-3 text-[14px] text-[#666] text-right">{formatCurrency(selectedProduct.cost)}</td>
                  <td className="px-4 py-3 text-[14px] text-[#666] text-right">{formatCurrency(selectedProduct.price)}</td>
                  <td className="px-4 py-3 text-[14px] text-right">{selectedProduct.stock}</td>
                  <td className="px-4 py-3 text-[14px] text-[#666]">{selectedProduct.location}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={selectedProduct.status}
                        onCheckedChange={handleToggleStatus}
                      />
                      <span className={`text-[12px] font-medium ${selectedProduct.status ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                        {selectedProduct.status ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detail Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Image & Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] row-span-2">
              <div className="h-[200px] bg-[#F5F5F5] rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <Image size={48} className="text-[#D0D0D0]" />
                )}
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-1">{selectedProduct.name}</h3>
              <p className="text-[14px] text-[#666] mb-4 line-clamp-3">{selectedProduct.description}</p>
              <button
                onClick={() => startEdit('name_desc', selectedProduct.name)}
                className="px-3 py-1.5 bg-[#F5A623] text-white text-[12px] font-medium rounded-md hover:bg-[#E09400] transition-colors"
              >
                <span className="flex items-center gap-1"><Edit3 size={12} /> Modificar</span>
              </button>
            </div>

            {/* Costo Card */}
            <ValueCard
              label="Costo"
              value={formatCurrency(selectedProduct.cost)}
              isEditing={editingField === 'cost'}
              editValue={editValues['cost'] || ''}
              onStartEdit={() => startEdit('cost', String(selectedProduct.cost))}
              onChange={v => setEditValues(prev => ({ ...prev, cost: v }))}
              onSave={() => saveEdit('cost')}
              onCancel={() => setEditingField(null)}
            />

            {/* Precio Card */}
            <ValueCard
              label="Precio"
              value={formatCurrency(selectedProduct.price)}
              isEditing={editingField === 'price'}
              editValue={editValues['price'] || ''}
              onStartEdit={() => startEdit('price', String(selectedProduct.price))}
              onChange={v => setEditValues(prev => ({ ...prev, price: v }))}
              onSave={() => saveEdit('price')}
              onCancel={() => setEditingField(null)}
            />

            {/* Stock Card */}
            <ValueCard
              label="Stock"
              value={String(selectedProduct.stock)}
              isEditing={editingField === 'stock'}
              editValue={editValues['stock'] || ''}
              onStartEdit={() => startEdit('stock', String(selectedProduct.stock))}
              onChange={v => setEditValues(prev => ({ ...prev, stock: v }))}
              onSave={() => saveEdit('stock')}
              onCancel={() => setEditingField(null)}
            />

            {/* Ubicación Card */}
            <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <p className="text-[12px] uppercase text-[#999] font-medium mb-2">Ubicación</p>
              {editingField === 'location' ? (
                <div className="space-y-2">
                  <select
                    value={editValues['location'] || selectedProduct.location}
                    onChange={e => setEditValues(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit('location')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#22C55E] text-white text-[12px] font-medium rounded-md hover:bg-[#1A9A4A] transition-colors"
                    >
                      <Check size={12} /> Guardar
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#EF4444] text-white text-[12px] font-medium rounded-md hover:bg-[#D32F2F] transition-colors"
                    >
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[24px] font-semibold text-[#1A1A1A] mb-3">{selectedProduct.location}</p>
                  <button
                    onClick={() => startEdit('location', selectedProduct.location)}
                    className="px-3 py-1.5 bg-[#F5A623] text-white text-[12px] font-medium rounded-md hover:bg-[#E09400] transition-colors"
                  >
                    <span className="flex items-center gap-1"><Edit3 size={12} /> Modificar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* New Product Modal */}
      <NewProductModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        locations={locations}
        onProductCreated={(product) => {
          setSelectedProduct(product);
          setShowNewModal(false);
        }}
      />
    </div>
  );
}

// Value Card Component
function ValueCard({
  label,
  value,
  isEditing,
  editValue,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <p className="text-[12px] uppercase text-[#999] font-medium mb-2">{label}</p>
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="number"
            value={editValue}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSave()}
            autoFocus
            className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[24px] font-bold text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#22C55E] text-white text-[12px] font-medium rounded-md hover:bg-[#1A9A4A] transition-colors"
            >
              <Check size={12} /> Guardar
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#EF4444] text-white text-[12px] font-medium rounded-md hover:bg-[#D32F2F] transition-colors"
            >
              <X size={12} /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[36px] font-bold text-[#1A1A1A] mb-3">{value}</p>
          <button
            onClick={onStartEdit}
            className="px-3 py-1.5 bg-[#F5A623] text-white text-[12px] font-medium rounded-md hover:bg-[#E09400] transition-colors"
          >
            <span className="flex items-center gap-1"><Edit3 size={12} /> Modificar</span>
          </button>
        </>
      )}
    </div>
  );
}

// New Product Modal
function NewProductModal({
  open,
  onClose,
  locations,
  onProductCreated,
}: {
  open: boolean;
  onClose: () => void;
  locations: string[];
  onProductCreated: (product: Product) => void;
}) {
  const { addProduct } = useApp();
  const existingIds = getProducts().map(p => p.productId);
  const nextId = getNextProductId(existingIds);

  const [form, setForm] = useState({
    productId: nextId,
    name: '',
    description: '',
    cost: '',
    price: '',
    stock: '',
    location: locations[0] || 'Bodega 1',
    imageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.cost || !form.price || !form.stock) {
      return;
    }

    const product = addProduct({
      productId: form.productId,
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      cost: Number(form.cost),
      price: Number(form.price),
      stock: Number(form.stock),
      location: form.location,
      status: true,
    });

    onProductCreated(product);
  };

  const isValid = form.name && form.description && form.cost && form.price && form.stock;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-semibold">Nuevo Producto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Image Upload Area */}
          <div className="h-[120px] border-2 border-dashed border-[#D0D0D0] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1A1A1A] transition-colors">
            <Image size={24} className="text-[#999] mb-1" />
            <span className="text-[12px] text-[#999]">Arrastra o haz click para subir</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium block mb-1">ID Producto</label>
              <input
                type="text"
                value={form.productId}
                readOnly
                className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[14px] bg-[#F5F5F5] text-[#666]"
              />
            </div>
            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium block mb-1">Ubicación</label>
              <select
                value={form.location}
                onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] uppercase text-[#999] font-medium block mb-1">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-[12px] uppercase text-[#999] font-medium block mb-1">Descripción *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium block mb-1">Costo *</label>
              <input
                type="number"
                value={form.cost}
                onChange={e => setForm(prev => ({ ...prev, cost: e.target.value }))}
                className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                required
                min={0}
              />
            </div>
            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium block mb-1">Precio *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                required
                min={0}
              />
            </div>
            <div>
              <label className="text-[12px] uppercase text-[#999] font-medium block mb-1">Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full h-10 px-3 border border-[#D0D0D0] rounded-lg text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                required
                min={0}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full h-[44px] bg-[#1A1A1A] text-white text-[14px] font-bold rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
