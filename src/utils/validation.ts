
import { Priority } from "../models/ShoppingItem";

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function validateBudget(value: string): ValidationResult {
  if (!value.trim()) {
    return {
      valid: false,
      message: "Veuillez saisir un budget."
    };
  }

  const amount = Number(value.replace(",", "."));

  if (!Number.isFinite(amount)) {
    return {
      valid: false,
      message: "Veuillez saisir un montant valide."
    };
  }

  if (amount <= 0) {
    return {
      valid: false,
      message: "Le budget doit être supérieur à zéro."
    };
  }

  if (amount > 1000000) {
    return {
      valid: false,
      message: "Le montant du budget est trop élevé."
    };
  }

  return { valid: true, message: "" };
}

export function validateItem(
  name: string,
  price: string,
  quantity: string,
  existingNames: string[]
): ValidationResult {
  if (!name.trim()) {
    return {
      valid: false,
      message: "Le nom de l'article est obligatoire."
    };
  }

  const parsedPrice = Number(price.replace(",", "."));
  const parsedQuantity = Number(quantity);

  if (!price.trim() || !Number.isFinite(parsedPrice)) {
    return {
      valid: false,
      message: "Veuillez saisir un prix valide."
    };
  }

  if (parsedPrice <= 0) {
    return {
      valid: false,
      message: "Le prix doit être supérieur à zéro."
    };
  }

  if (!Number.isInteger(parsedPrice * 1000)) {
    return {
      valid: false,
      message: "Utilisez au maximum trois chiffres après la virgule."
    };
  }

  if (!quantity.trim() || !Number.isInteger(parsedQuantity)) {
    return {
      valid: false,
      message: "La quantité doit être un nombre entier."
    };
  }

  if (parsedQuantity < 1 || parsedQuantity > 999) {
    return {
      valid: false,
      message: "La quantité doit être comprise entre 1 et 999."
    };
  }

  const duplicate = existingNames.some(
    existing =>
      existing.toLowerCase() === name.trim().toLowerCase()
  );

  if (duplicate) {
    return {
      valid: false,
      message: "Cet article existe déjà dans votre liste."
    };
  }

  return { valid: true, message: "" };
}

export function isValidPriority(value: string): value is Priority {
  return ["essential", "useful", "comfort"].includes(value);
}
