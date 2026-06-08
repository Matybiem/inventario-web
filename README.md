# Sistema de Inventario Web

Un sistema de gestión de inventario modular desarrollado con React, TypeScript y arquitectura feature-based.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura de **monólito modular** con módulos feature-based independientes:

- **`src/modules/core/`**: Router, layout y componentes globales
- **`src/modules/dashboard/`**: Dashboard con métricas y estadísticas
- **`src/modules/productos/`**: Gestión de productos (CRUD, búsqueda, filtros)
- **`src/modules/ventas/`**: Gestión de ventas y actualización de stock

Cada módulo contiene:
- `pages/`: Componentes de página
- `service.ts`: Lógica de negocio
- `store.ts`: Gestión de estado y persistencia
- `model.ts`: Tipos específicos del módulo
- `hooks/`: Hooks personalizados (opcional)
- `ui/`: Componentes UI específicos (opcional)

## 🛠️ Tecnologías

- **Frontend**: React 19.2.0 con TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Icons**: Lucide React
- **Persistence**: localStorage (datos mock incluidos)

## 📊 Características

### Dashboard
- Métricas de stock (crítico, bajo, normal)
- Meta diaria de ventas
- Productos más vendidos
- Ventas por mes
- Stock crítico

### Gestión de Productos
- CRUD completo de productos
- Búsqueda y filtros avanzados
- Gestión de stock
- Historial de búsquedas
- Ubicaciones de bodega

### Ventas
- Creación de ventas con múltiples productos
- Actualización automática de stock
- Cálculo de totales
- Historial de ventas
- Estadísticas mensuales

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── modules/
│   ├── core/           # Router, layout, sidebar, toast
│   ├── dashboard/      # Dashboard con métricas
│   ├── productos/      # Gestión de productos
│   └── ventas/         # Gestión de ventas
├── components/ui/      # Componentes shadcn/ui compartidos
├── data/               # Datos mock iniciales
├── hooks/              # Hooks compartidos
├── lib/                # Utilidades
└── types/              # Definiciones de tipos globales
```

## 🔄 Flujo de Datos

1. **UI Layer** → Componentes de interfaz
2. **Service Layer** → Lógica de negocio
3. **Store Layer** → Gestión de estado
4. **Persistence** → localStorage

Los módulos pueden depender de servicios de otros módulos (ej: ventas actualiza stock de productos).

## 📋 Entidades

- **Product**: Información de productos (ID, nombre, precio, stock, ubicación)
- **Sale**: Ventas realizadas con fecha y total
- **SaleItem**: Items individuales de una venta
- **DailyGoal**: Meta de ventas diaria
- **StockThresholds**: Umbrales de stock (crítico, bajo, normal)

## 🎯 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run lint` - Ejecutar ESLint
- `npm run preview` - Preview del build
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
