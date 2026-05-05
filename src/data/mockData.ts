import type { Product, Sale, SaleItem, DailyGoal, StockThresholds, SearchHistoryItem } from '@/types';

let idCounter = 0;
const genId = () => {
  idCounter++;
  return `id_${Date.now()}_${idCounter}`;
};

const now = new Date().toISOString();

// Generate products
export const initialProducts: Product[] = [
  {
    id: genId(),
    productId: '0001',
    name: 'Martillo',
    description: 'Martillo de Hierro con mango de madera',
    imageUrl: '',
    cost: 3990,
    price: 7990,
    stock: 527,
    location: 'Bodega 1',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0002',
    name: 'Destornillador Plano',
    description: 'Destornillador plano 6mm mango ergonómico',
    imageUrl: '',
    cost: 2490,
    price: 4990,
    stock: 342,
    location: 'Bodega 1',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0003',
    name: 'Destornillador Cruz',
    description: 'Destornillador Phillips PH2',
    imageUrl: '',
    cost: 2490,
    price: 4990,
    stock: 289,
    location: 'Bodega 2',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0004',
    name: 'Llave Inglesa',
    description: 'Llave ajustable 10" cromada',
    imageUrl: '',
    cost: 8990,
    price: 15990,
    stock: 156,
    location: 'Bodega 2',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0005',
    name: 'Alicate',
    description: 'Alicate universal 8" mango antideslizante',
    imageUrl: '',
    cost: 5990,
    price: 9990,
    stock: 203,
    location: 'Bodega 1',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0006',
    name: 'Sierra Manual',
    description: 'Sierra de arco 12" para madera',
    imageUrl: '',
    cost: 7990,
    price: 13990,
    stock: 87,
    location: 'Bodega 3',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0007',
    name: 'Cinta Métrica',
    description: 'Cinta métrica 5m autoblocante',
    imageUrl: '',
    cost: 3490,
    price: 6990,
    stock: 412,
    location: 'Bodega 1',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0008',
    name: 'Nivel Burbuja',
    description: 'Nivel de burbuja 30cm aluminio',
    imageUrl: '',
    cost: 4990,
    price: 8990,
    stock: 178,
    location: 'Bodega 3',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0009',
    name: 'Taladro Eléctrico',
    description: 'Taladro percutor 550W velocidad variable',
    imageUrl: '',
    cost: 29990,
    price: 49990,
    stock: 45,
    location: 'Bodega 4',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0010',
    name: 'Lijadora Orbital',
    description: 'Lijadora orbital 240W con colector de polvo',
    imageUrl: '',
    cost: 24990,
    price: 39990,
    stock: 32,
    location: 'Bodega 4',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0011',
    name: 'Soldadora',
    description: 'Soldadora inverter 160A portátil',
    imageUrl: '',
    cost: 59990,
    price: 89990,
    stock: 18,
    location: 'Bodega 5',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0012',
    name: 'Amoladora Angular',
    description: 'Amoladora angular 4½" 750W',
    imageUrl: '',
    cost: 19990,
    price: 32990,
    stock: 56,
    location: 'Bodega 5',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0013',
    name: 'Compresor Aire',
    description: 'Compresor de aire 24L 2HP',
    imageUrl: '',
    cost: 79990,
    price: 129990,
    stock: 12,
    location: 'Bodega 6',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0014',
    name: 'Pistola Pintura',
    description: 'Pistola para pintar HVLP 600ml',
    imageUrl: '',
    cost: 14990,
    price: 24990,
    stock: 73,
    location: 'Bodega 3',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0015',
    name: 'Caladora',
    description: 'Caladora 400W velocidad variable',
    imageUrl: '',
    cost: 18990,
    price: 29990,
    stock: 41,
    location: 'Bodega 4',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0016',
    name: 'Pulidora',
    description: 'Pulidora orbital 150mm 440W',
    imageUrl: '',
    cost: 34990,
    price: 54990,
    stock: 28,
    location: 'Bodega 5',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0017',
    name: 'Sierra Circular',
    description: 'Sierra circular 7¼" 1400W',
    imageUrl: '',
    cost: 44990,
    price: 69990,
    stock: 15,
    location: 'Bodega 6',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0018',
    name: 'Router',
    description: 'Router fresadora 1100W con bases',
    imageUrl: '',
    cost: 39990,
    price: 62990,
    stock: 22,
    location: 'Bodega 6',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0019',
    name: 'Clavadora',
    description: 'Clavadora neumática para acabados',
    imageUrl: '',
    cost: 45990,
    price: 72990,
    stock: 9,
    location: 'Bodega 5',
    status: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: genId(),
    productId: '0020',
    name: 'Hidrolavadora',
    description: 'Hidrolavadora eléctrica 1400W 100bar',
    imageUrl: '',
    cost: 54990,
    price: 84990,
    stock: 6,
    location: 'Bodega 6',
    status: false,
    createdAt: now,
    updatedAt: now,
  },
];

// Generate sales for different months
const generateSales = (): Sale[] => {
  const sales: Sale[] = [];
  const currentYear = new Date().getFullYear();
  const productPool = initialProducts.filter(p => p.status);

  // Generate ~50 sales across months
  for (let i = 0; i < 50; i++) {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    const date = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const numItems = Math.floor(Math.random() * 4) + 1;
    const items: SaleItem[] = [];
    let totalAmount = 0;
    let totalItems = 0;

    for (let j = 0; j < numItems; j++) {
      const product = productPool[Math.floor(Math.random() * productPool.length)];
      const qty = Math.floor(Math.random() * 5) + 1;
      const subtotal = qty * product.price;
      items.push({
        id: genId(),
        saleId: '',
        productId: product.id,
        quantity: qty,
        unitPrice: product.price,
        subtotal,
        productName: product.name,
      });
      totalAmount += subtotal;
      totalItems += qty;
    }

    const saleId = genId();
    items.forEach(item => item.saleId = saleId);

    sales.push({
      id: saleId,
      saleDate: date,
      totalAmount,
      totalItems,
      createdAt: date,
      items,
    });
  }

  return sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
};

export const initialSales: Sale[] = generateSales();

export const initialDailyGoal: DailyGoal = {
  id: genId(),
  goalDate: new Date().toISOString().split('T')[0],
  targetAmount: 200000,
};

export const initialThresholds: StockThresholds = {
  id: genId(),
  criticalMin: 0,
  criticalMax: 15,
  lowMin: 16,
  lowMax: 49,
  normalMin: 50,
  normalMax: 100,
  updatedAt: now,
};

export const initialSearchHistory: SearchHistoryItem[] = [
  { id: genId(), productId: initialProducts[0].id, searchedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: genId(), productId: initialProducts[7].id, searchedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: genId(), productId: initialProducts[2].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: genId(), productId: initialProducts[4].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: genId(), productId: initialProducts[6].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: genId(), productId: initialProducts[1].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: genId(), productId: initialProducts[3].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: genId(), productId: initialProducts[5].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: genId(), productId: initialProducts[8].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: genId(), productId: initialProducts[10].id, searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
];
