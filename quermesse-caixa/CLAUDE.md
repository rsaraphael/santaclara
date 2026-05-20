# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Getting Started

```bash
npm install      # Install dependencies
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

This is a single-page React application (Vite + React) with Material Design UI for managing a quermesse (festival) cash register.

### Main Component Structure

**App.jsx** - Single file containing:
- **Caixa Tab**: Product grid, shopping cart, quantity selector, checkout flow
- **Admin Tab**: Sales history, filtering by payment method, totals breakdown
- **Fichas Tab**: Cash drawer management, change mode selection, bill tracking
- **Dialogs**: Payment method selection, change calculation (Dinheiro), confirmation dialogs

### Data Flow

1. **Products**: Loaded from `src/products.json` on mount
2. **Cart**: Managed in state (`cart` array), updated via `addToCart`, `updateCartItem`, `removeFromCart`
3. **Sales**: Persisted to localStorage key `'quermesse-sales'` with structure:
   ```js
   {
     id: timestamp,
     timestamp: ISO string,
     items: [{ id, name, price, quantity }],
     total: number,
     paymentMethod: 'Pix' | 'Cartão' | 'Dinheiro',
     amountReceived: number,  // for Dinheiro only
     change: number,          // for Dinheiro only
     changeGiven: { 1: n, 2: n, 5: n, 10: n, 20: n }  // for Dinheiro only
   }
   ```
4. **Fichas (Cash Drawer)**: Persisted to localStorage key `'quermesse-fichas'` with structure:
   ```js
   { 1: number, 2: number, 5: number, 10: number, 20: number }
   ```
5. **Change Mode**: Persisted to localStorage key `'quermesse-change-mode'` ('normal' or 'privilegiar_troco')

### Key State Variables

- `currentTab`: 'caixa' | 'admin' | 'fichas' - Tab navigation
- `cart`: Array of items in current sale
- `sales`: Array of completed sales (from localStorage)
- `fichas`: Cash drawer bill counts (from localStorage)
- `changeMode`: 'normal' | 'privilegiar_troco' - Change calculation preference
- `adminFilter`: 'all' | 'pix' | 'cartao' | 'dinheiro' - Admin panel filter
- `amountReceived`: User input for Dinheiro payment
- `suggestedChange`: Calculated change breakdown for Dinheiro
- `paymentDialogOpen`, `changeDialogOpen`, `confirmClearDialogOpen`, `deleteSaleDialogOpen`: Dialog visibility
- `saleToDelete`: Sale pending deletion confirmation

### Payment Flow

1. User adds items to cart
2. Click "Finalizar Venda" → Opens payment dialog
3. **Pix/Cartão**: Saves sale to localStorage, clears cart
4. **Dinheiro**: Opens change dialog
   - User enters amount received
   - App calculates change based on selected mode and available fichas
   - Shows suggested bills to give
   - Confirm → Saves sale, updates fichas (adds received, subtracts change), clears cart

### Change Calculation Algorithms

**Normal Mode**: Greedy approach - use largest bills first (20→10→5→2→1)
**Privilegiar Troco Mode**: Prefer smaller bills (5, 2) first for better future change flexibility

### Fichas (Cash Drawer) Features

- Set bill counts for denominations: 1, 2, 5, 10, 20
- Toggle between Normal/Privilegiar Troco mode
- Total cash drawer value display
- Reset fichas button
- Automatic updates after Dinheiro sales
