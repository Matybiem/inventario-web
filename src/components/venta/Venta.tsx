import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { getProductById, getProductByProductId, getSales, updateProductStock, getProducts } from '@/data/store';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { FileText, Clock, X, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Venta.css';

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
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingQty, setPendingQty] = useState('1');
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [editQtyValue, setEditQtyValue] = useState('1');
  const [showHistory, setShowHistory] = useState(false);
  const [currentBoleta, setCurrentBoleta] = useState(() => {
    const saved = localStorage.getItem('inv_current_boleta');
    return saved ? parseInt(saved, 10) : 10001;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const filterProducts = (query: string): Product[] => {
    if (!query.trim()) return [];
    const allProducts = getProducts();
    const lowerQuery = query.toLowerCase();
    return allProducts
      .filter(p =>
        p.productId.toLowerCase().includes(lowerQuery) ||
        p.name.toLowerCase().includes(lowerQuery) ||
        p.id.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  };

  const selectProduct = (product: Product) => {
    if (!product.status) {
      showToast('Producto está inactivo', 'error');
      return;
    }

    if (product.stock <= 0) {
      showToast('Producto sin stock disponible', 'error');
      return;
    }

    const existing = items.find(item => item.product.id === product.id);
    if (existing) {
      showToast('Producto ya está en la boleta', 'error');
      return;
    }

    setPendingProduct(product);
    setPendingQty('1');
    setEditingQty('pending');
    setInputId('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputId(value);
    setSelectedSuggestionIndex(-1);
    if (value.trim()) {
      const filtered = filterProducts(value);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddProduct = () => {
    const id = inputId.trim();
    if (!id) return;

    const product = getProductByProductId(id) ?? getProductById(id);
    if (!product) {
      showToast('Producto no encontrado', 'error');
      setInputId('');
      return;
    }

    selectProduct(product);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (pendingProduct) return;
        handleAddProduct();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectProduct(suggestions[selectedSuggestionIndex]);
        } else if (inputId.trim()) {
          handleAddProduct();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSubmitPendingQty = (qtyValue: string) => {
    if (!pendingProduct) return;

    const parsedQty = Number(qtyValue);
    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      showToast('Ingrese una cantidad válida', 'error');
      return;
    }

    if (parsedQty > pendingProduct.stock) {
      showToast(`Stock máximo disponible: ${pendingProduct.stock}`, 'error');
      return;
    }

    const newItem: SaleItem = {
      id: `item_${Date.now()}`,
      product: pendingProduct,
      quantity: parsedQty,
      unitPrice: pendingProduct.price,
      subtotal: parsedQty * pendingProduct.price,
    };

    setItems(prev => [...prev, newItem]);
    setPendingProduct(null);
    setPendingQty('1');
    setEditingQty(null);
    setInputId('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (editingQty) {
      qtyInputRef.current?.focus();
      qtyInputRef.current?.select();
    }
  }, [editingQty]);

  const handleQtyEdit = (itemId: string, newQty: string) => {
    if (itemId === 'pending') {
      handleSubmitPendingQty(newQty);
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const parsedQty = Number(newQty);
    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      showToast('Ingrese una cantidad válida', 'error');
      return;
    }

    if (parsedQty > item.product.stock) {
      showToast(`Stock máximo disponible: ${item.product.stock}`, 'error');
      setEditingQty(null);
      inputRef.current?.focus();
      return;
    }

    setItems(prev =>
      prev.map(i =>
        i.id === itemId
          ? { ...i, quantity: parsedQty, subtotal: parsedQty * i.unitPrice }
          : i
      )
    );
    setEditingQty(null);
    setEditQtyValue('1');
    inputRef.current?.focus();
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
    doc.text(`N° Boleta: ${String(currentBoleta).padStart(6, '0')}`, 14, 42);

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

    doc.save(`boleta_${String(currentBoleta).padStart(6, '0')}.pdf`);
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
    const nextBoleta = currentBoleta + 1;
    setCurrentBoleta(nextBoleta);
    localStorage.setItem('inv_current_boleta', nextBoleta.toString());
    showToast('Venta guardada exitosamente', 'success');
  };

  return (
    <div className="venta-container">
      {/* Header */}
      <div className="venta-header">
        <h1 className="venta-title">Venta/Boleta</h1>
        <div className="venta-header-buttons">
          <button
            onClick={() => setShowHistory(true)}
            className="venta-btn"
          >
            <Clock size={16} />
            Historial
          </button>
          <button
            onClick={handleExportPDF}
            className="venta-btn venta-btn-primary"
          >
            <FileText size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Boleta Number */}
      <div className="venta-boleta-number">
        <span>Boleta N°: {String(currentBoleta).padStart(6, '0')}</span>
      </div>

      {/* Sale Table */}
      <div className="venta-table-container" ref={tableContainerRef}>
        <table className="venta-table">
          <thead className="venta-thead">
            <tr>
              <th className="venta-th">Item</th>
              <th className="venta-th venta-th--producto">Producto</th>
              <th className="venta-th venta-th--cantidad">Cantidad</th>
              <th className="venta-th venta-th-right">Precio</th>
              <th className="venta-th venta-th-right">Total</th>
            </tr>
          </thead>
          <tbody className="venta-tbody">
            {items.map((item, i) => (
              <tr
                key={item.id}
                className="venta-tr"
              >
                <td className="venta-td venta-td-boleta">{String(i + 1).padStart(3, '0')}</td>
                <td className="venta-td">{item.product.name}</td>
                <td className="venta-td venta-td-center">
                  {editingQty === item.id ? (
                    <input
                      ref={qtyInputRef}
                      type="number"
                      value={editQtyValue}
                      onChange={e => setEditQtyValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQtyEdit(item.id, editQtyValue);
                        } else if (e.key === 'Escape') {
                          setEditingQty(null);
                        }
                      }}
                      onBlur={() => handleQtyEdit(item.id, editQtyValue)}
                      className={editingQty === item.id ? 'venta-qty-input venta-qty-input-editing animate-pulse-border' : 'venta-qty-input'}
                      min={1}
                      max={item.product.stock}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingQty(item.id);
                        setEditQtyValue(String(item.quantity));
                      }}
                      className="venta-qty-btn"
                    >
                      {item.quantity}
                    </button>
                  )}
                </td>
                <td className="venta-td venta-td-right venta-td-gray">{formatCurrency(item.unitPrice)}</td>
                <td className="venta-td venta-td-right venta-td-bold">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
            {pendingProduct ? (
              <tr className="venta-tr">
                <td className="venta-td venta-td-boleta">{String(items.length + 1).padStart(3, '0')}</td>
                <td className="venta-td">{pendingProduct.name}</td>
                <td className="venta-td venta-td-center">
                  <input
                    ref={qtyInputRef}
                    type="number"
                    value={pendingQty}
                    onChange={e => setPendingQty(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQtyEdit('pending', pendingQty);
                      } else if (e.key === 'Escape') {
                        setPendingProduct(null);
                        setEditingQty(null);
                        inputRef.current?.focus();
                      }
                    }}
                    className="venta-qty-input venta-qty-input-editing animate-pulse-border"
                    min={1}
                    max={pendingProduct.stock}
                  />
                </td>
                <td className="venta-td venta-td-right venta-td-gray">{formatCurrency(pendingProduct.price)}</td>
                <td className="venta-td venta-td-right venta-td-bold">{formatCurrency(pendingProduct.price)}</td>
              </tr>
            ) : (
              <tr className="venta-tr-input">
                <td className="venta-td venta-td-boleta">
                  <span>{String(items.length + 1).padStart(3, '0')}</span>
                </td>
                <td colSpan={4} className="venta-input-row">
                  <Search size={16} className="venta-input-icon" />
                  <div className="venta-input-wrapper">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputId}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder="Ingresar id_producto y presionar Enter..."
                      className="venta-input animate-pulse-border"
                    />
                  </div>
                </td>
              </tr>
            )}
            {/* Total Row */}
            {items.length > 0 && (
              <tr className="venta-tr-total">
                <td className="venta-td venta-td-bold">TOTAL</td>
                <td className="venta-td"></td>
                <td className="venta-td venta-td-center venta-td-bold">{totalQuantity}</td>
                <td className="venta-td"></td>
                <td className="venta-td venta-td-right venta-td-bold">{formatCurrency(totalAmount)}</td>
              </tr>
            )}
          </tbody>
        </table>
        {showSuggestions && suggestions.length > 0 && (
          <div className="venta-suggestions-dropdown venta-suggestions-dropdown-outside">
            {suggestions.map((product, index) => (
              <div
                key={product.id}
                onClick={() => selectProduct(product)}
                className={`venta-suggestion-item ${
                  index === selectedSuggestionIndex ? 'venta-suggestion-selected' : ''
                }`}
              >
                <div className="venta-suggestion-id">{product.productId}</div>
                <div className="venta-suggestion-name">{product.name}</div>
                <div className="venta-suggestion-stock">Stock: {product.stock}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Sale Button */}
      {items.length > 0 && (
        <button
          onClick={handleSaveSale}
          className="venta-save-btn"
        >
          Generar Boleta
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
      <div className="venta-modal-overlay" onClick={onClose} />
      <div className="venta-modal">
        <div className="venta-modal-header">
          <h3 className="venta-modal-title">Historial de Boletas</h3>
          <button onClick={onClose} className="venta-modal-close">
            <X size={18} className="venta-modal-close-icon" />
          </button>
        </div>
        <div className="venta-modal-content">
          <table className="venta-history-table">
            <thead className="venta-history-thead">
              <tr>
                <th className="venta-history-th">Fecha</th>
                <th className="venta-history-th venta-history-th-right">Items</th>
                <th className="venta-history-th venta-history-th-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="venta-history-tr">
                  <td className="venta-history-td">
                    {new Date(sale.saleDate).toLocaleDateString('es-CL')}
                  </td>
                  <td className="venta-history-td venta-history-td-right venta-history-td-gray">{sale.totalItems}</td>
                  <td className="venta-history-td venta-history-td-right">{formatCurrency(sale.totalAmount)}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={3} className="venta-history-empty">
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
