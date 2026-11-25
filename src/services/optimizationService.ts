
import {
  ShoppingItem,
  OptimizationResult,
  Priority
} from "../models/ShoppingItem";

const PRIORITY_ORDER: Record<Priority, number> = {
  essential: 1,
  useful: 2,
  comfort: 3
};

export function optimizeBasket(
  items: ShoppingItem[],
  budget: number
): OptimizationResult {
  const sortedItems = [...items]
    .filter(item => !item.purchased)
    .sort((a, b) => {
      const priorityDifference =
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      const costA = a.price * a.quantity;
      const costB = b.price * b.quantity;

      if (costA !== costB) {
        return costA - costB;
      }

      return a.name.localeCompare(b.name);
    });

  const selectedItems: ShoppingItem[] = [];
  const removedItems: ShoppingItem[] = [];

  let remaining = budget;

  for (const item of sortedItems) {
    const subtotal = item.price * item.quantity;

    if (subtotal <= remaining) {
      selectedItems.push(item);
      remaining -= subtotal;
    } else {
      removedItems.push(item);
    }
  }

  const total = budget - remaining;

  return {
    selectedItems,
    removedItems,
    total,
    remaining,
    budget
  };
}
