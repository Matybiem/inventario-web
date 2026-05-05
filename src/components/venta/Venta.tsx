import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { getProductByProductId, getSales, updateProductStock } from '@/data/store';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { FileText, Clock, X, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SaleItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export default function Venta() {
  const { showToast, createSale } = useApp();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [inputId, setInputId] = useState('');
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [editQtyValue, setEditQtyValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddProduct = () => {
    const id = inputId.trim();
    if (!id) return;

    const product = getProductByProductId(id);
    if (!product) {
      showToast('Producto no encontrado', 'error');
      setInputId('');
      return;
    }

    if (!product.status) {
      showToast('Producto está inactivo', 'error');
      setInputId('');
      return;
    }

    if (product.stock <= 0) {
      showToast('Producto sin stock disponible', 'error');
      setInputId('');
      return;
    }

    // Check if already in list
    const existing = items.find(item => item.product.id === product.id);
    if (existing) {
      showToast('Producto ya está en la boleta', 'error');
      setInputId('');
      return;
    }

    const newItem: SaleItem = {
      id: `item_${Date.now()}`,
      product,
      quantity: 1,
      unitPrice: product.price,
      subtotal: product.price,
    };

    setItems(prev => [...prev, newItem]);
    setInputId('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProduct();
    }
  };

  const handleQtyEdit = (itemId: string, newQty: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (newQty <= 0) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      return;
    }

    if (newQty > item.product.stock) {
      showToast(`Stock máximo disponible: ${item.product.stock}`, 'error');
      setEditingQty(null);
      return;
    }

    setItems(prev =>
      prev.map(i =>
        i.id === itemId
          ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice }
          : i
      )
    );
    setEditingQty(null);
  };

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  const handleExportPDF = () => {
    if (items.length === 0) {
      showToast('No hay productos para exportar', 'error');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Boleta de Venta', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, 14, 35);
    doc.text(`N° Boleta: ${Date.now().toString().slice(-6)}`, 14, 42);

    autoTable(doc, {
      startY: 50,
      head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
      body: items.map(item => [
        item.product.name,
        item.quantity.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.subtotal),
      ]),
      foot: [['TOTAL', totalQuantity.toString(), '', formatCurrency(totalAmount)]],
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255] },
      footStyles: { fillColor: [245, 245, 245], textColor: [26, 26, 26], fontStyle: 'bold' },
    });

    doc.save(`boleta_${Date.now()}.pdf`);
    showToast('PDF exportado exitosamente', 'success');
  };

  const handleSaveSale = () => {
    if (items.length === 0) {
      showToast('No hay productos para guardar', 'error');
      return;
    }

    // Deduct stock
    items.forEach(item => {
      const newStock = item.product.stock - item.quantity;
      updateProductStock(item.product.id, newStock);
    });

    // Create sale record
    createSale({
      saleDate: new Date().toISOString().split('T')[0],
      totalAmount,
      totalItems: totalQuantity,
      items: items.map(item => ({
        id: item.id,
        saleId: '',
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        productName: item.product.name,
      })),
    });

    setItems([]);
    showToast('Venta guardada exitosamente', 'success');
  };

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#1A1A1A]">Venta/Boleta</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 h-[36px] border border-[#D0D0D0] rounded-lg text-[14px] font-medium text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
          >
            <Clock size={16} />
            Historial
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 h-[36px] bg-[#1A1A1A] text-white rounded-lg text-[14px] font-medium hover:bg-[#333] transition-colors"
          >
            <FileText size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Sale Table */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5]">
              <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3 w-[80px]">Boleta</th>
              <th className="text-left text-[12px] uppercase text-[#666] font-medium px-4 py-3">Producto</th>
              <th className="text-center text-[12px] uppercase text-[#666] font-medium px-4 py-3 w-[100px]">Cantidad</th>
              <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3 w-[120px]">Precio</th>
              <th className="text-right text-[12px] uppercase text-[#666] font-medium px-4 py-3 w-[120px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.id}
                className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA]"
                style={{ backgroundColor: i % 2 === 1 ? '#FAFAFA' : 'white' }}
              >
                <td className="px-4 py-2.5 text-[14px] text-[#666]">{String(i + 1).padStart(3, '0')}</td>
                <td className="px-4 py-2.5 text-[14px] text-[#1A1A1A]">{item.product.name}</td>
                <td className="px-4 py-2.5 text-center">
                  {editingQty === item.id ? (
                    <input
                      type="number"
                      value={editQtyValue}
                      onChange={e => setEditQtyValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleQtyEdit(item.id, Number(editQtyValue));
                        } else if (e.key === 'Escape') {
                          setEditingQty(null);
                        }
                      }}
                      onBlur={() => handleQtyEdit(item.id, Number(editQtyValue))}
                      autoFocus
                      className="w-16 h-8 text-center border border-[#D0D0D0] rounded text-[14px] focus:border-[#1A1A1A] focus:outline-none"
                      min={1}
                      max={item.product.stock}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingQty(item.id);
                        setEditQtyValue(String(item.quantity));
                      }}
                      className="text-[14px] text-[#1A1A1A] hover:text-[#F5A623] transition-colors font-medium"
                    >
                      {item.quantity}
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[14px] text-[#666] text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-2.5 text-[14px] text-[#1A1A1A] text-right font-medium">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
            {/* Input Row */}
            <tr className="border-b border-[#E5E5E5] border-dashed">
              <td className="px-4 py-2.5">
                <span className="text-[12px] text-[#999]">{String(items.length + 1).padStart(3, '0')}</span>
              </td>
              <td colSpan={4} className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-[#D0D0D0]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputId}
                    onChange={e => setInputId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingresar id_producto y presionar Enter..."
                    className="w-full h-[36px] text-[14px] text-[#1A1A1A] placeholder:text-[#999] bg-transparent border-2 border-dashed border-[#D0D0D0] rounded-lg px-3 focus:border-[#1A1A1A] focus:outline-none transition-colors animate-pulse-border"
                  />
                </div>
              </td>
            </tr>
            {/* Total Row */}
            {items.length > 0 && (
              <tr className="bg-[#F5F5F5] border-t-2 border-[#1A1A1A]">
                <td className="px-4 py-3 text-[14px] font-bold text-[#1A1A1A]">TOTAL</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-center text-[14px] font-bold text-[#1A1A1A]">{totalQuantity}</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right text-[14px] font-bold text-[#1A1A1A]">{formatCurrency(totalAmount)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Save Sale Button */}
      {items.length > 0 && (
        <button
          onClick={handleSaveSale}
          className="w-full h-[44px] bg-[#1A1A1A] text-white text-[14px] font-bold rounded-lg hover:bg-[#333] transition-colors"
        >
          Guardar Venta
        </button>
      )}

      {/* History Modal */}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}

function HistoryModal({ onClose }: { onClose: () => void }) {
  const sales = getSales().slice(0, 20);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[500px] bg-white rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]">
          <h3 className="text-[18px] font-semibold text-[#1A1A1A]">Historial de Boletas</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg transition-colors">
            <X size={18} className="text-[#666]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="text-left text-[12px] uppercase text-[#666] font-medium pb-2">Fecha</th>
                <th className="text-right text-[12px] uppercase text-[#666] font-medium pb-2">Items</th>
                <th className="text-right text-[12px] uppercase text-[#666] font-medium pb-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-b border-[#E5E5E5] last:border-0">
                  <td className="py-2.5 text-[14px] text-[#1A1A1A]">
                    {new Date(sale.saleDate).toLocaleDateString('es-CL')}
                  </td>
                  <td className="py-2.5 text-[14px] text-[#666] text-right">{sale.totalItems}</td>
                  <td className="py-2.5 text-[14px] text-[#1A1A1A] text-right font-medium">{formatCurrency(sale.totalAmount)}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-[13px] text-[#999]">
                    No hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
