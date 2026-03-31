import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Item, ItemCarrinho } from '../data/mockData';

interface CartContextType {
  items: ItemCarrinho[];
  comercioId: number | null;
  comercioNome: string;
  addItem: (item: Item, quantidade?: number) => void;
  removeItem: (itemId: number) => void;
  updateQuantidade: (itemId: number, quantidade: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrinho[]>([]);
  const [comercioId, setComercioId] = useState<number | null>(null);
  const [comercioNome, setComercioNome] = useState('');

  const addItem = useCallback((item: Item, quantidade = 1) => {
    setItems(prev => {
      // Se o carrinho tem itens de outro comércio, limpa
      if (comercioId !== null && comercioId !== item.comercioId) {
        setComercioId(item.comercioId);
        return [{ item, quantidade }];
      }

      if (comercioId === null) {
        setComercioId(item.comercioId);
      }

      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci =>
          ci.item.id === item.id
            ? { ...ci, quantidade: ci.quantidade + quantidade }
            : ci
        );
      }
      return [...prev, { item, quantidade }];
    });
  }, [comercioId]);

  const removeItem = useCallback((itemId: number) => {
    setItems(prev => {
      const updated = prev.filter(ci => ci.item.id !== itemId);
      if (updated.length === 0) {
        setComercioId(null);
        setComercioNome('');
      }
      return updated;
    });
  }, []);

  const updateQuantidade = useCallback((itemId: number, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(ci =>
        ci.item.id === itemId ? { ...ci, quantidade } : ci
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setComercioId(null);
    setComercioNome('');
  }, []);

  const totalItems = items.reduce((acc, ci) => acc + ci.quantidade, 0);
  const subtotal = items.reduce((acc, ci) => acc + ci.item.preco * ci.quantidade, 0);

  return (
    <CartContext.Provider value={{
      items, comercioId, comercioNome, addItem,
      removeItem, updateQuantidade, clearCart, totalItems, subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
