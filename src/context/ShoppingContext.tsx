
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";

import { ShoppingItem } from "../models/ShoppingItem";

import {
  saveBudget,
  loadBudget,
  saveItems,
  loadItems
} from "../services/storageService";

interface ShoppingContextType {
  budget: number;
  items: ShoppingItem[];
  loading: boolean;
  setBudget: (value: number) => void;
  addItem: (item: ShoppingItem) => void;
  updateItem: (item: ShoppingItem) => void;
  deleteItem: (id: string) => void;
  togglePurchased: (id: string) => void;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(
  undefined
);

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const [budget, setBudgetState] = useState(0);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        const [savedBudget, savedItems] = await Promise.all([
          loadBudget(),
          loadItems()
        ]);

        setBudgetState(savedBudget);
        setItems(savedItems);
      } catch (error) {
        console.error("Could not load saved data:", error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveBudget(budget).catch(console.error);
    }
  }, [budget, loading]);

  useEffect(() => {
    if (!loading) {
      saveItems(items).catch(console.error);
    }
  }, [items, loading]);

  const setBudget = (value: number) => {
    setBudgetState(value);
  };

  const addItem = (item: ShoppingItem) => {
    setItems(previous => [...previous, item]);
  };

  const updateItem = (updatedItem: ShoppingItem) => {
    setItems(previous =>
      previous.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(previous => previous.filter(item => item.id !== id));
  };

  const togglePurchased = (id: string) => {
    setItems(previous =>
      previous.map(item =>
        item.id === id
          ? { ...item, purchased: !item.purchased }
          : item
      )
    );
  };

  return (
    <ShoppingContext.Provider
      value={{
        budget,
        items,
        loading,
        setBudget,
        addItem,
        updateItem,
        deleteItem,
        togglePurchased
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);

  if (!context) {
    throw new Error(
      "useShopping must be used inside ShoppingProvider"
    );
  }

  return context;
}
