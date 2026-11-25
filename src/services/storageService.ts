
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingItem } from "../models/ShoppingItem";

const BUDGET_KEY = "@marketbudget/budget";
const ITEMS_KEY = "@marketbudget/items";

export async function saveBudget(budget: number): Promise<void> {
  await AsyncStorage.setItem(BUDGET_KEY, String(budget));
}

export async function loadBudget(): Promise<number> {
  const value = await AsyncStorage.getItem(BUDGET_KEY);
  return value ? Number(value) : 0;
}

export async function saveItems(items: ShoppingItem[]): Promise<void> {
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export async function loadItems(): Promise<ShoppingItem[]> {
  const value = await AsyncStorage.getItem(ITEMS_KEY);

  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as ShoppingItem[] : [];
  } catch {
    return [];
  }
}
