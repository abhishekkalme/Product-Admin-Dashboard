import { Product } from "@/api/products";

const UPDATED_PRODUCTS_KEY = "updatedProducts";
const ADDED_PRODUCTS_KEY = "addedProducts";
const DELETED_PRODUCTS_KEY = "deletedProducts";

export const saveUpdatedProduct = (product: Product) => {
  const storedProducts = localStorage.getItem(
    UPDATED_PRODUCTS_KEY
  );

  const updatedProducts: Record<string, Product> =
    storedProducts ? JSON.parse(storedProducts) : {};

  updatedProducts[String(product.id)] = product;

  localStorage.setItem(
    UPDATED_PRODUCTS_KEY,
    JSON.stringify(updatedProducts)
  );
};

export const getUpdatedProducts = (): Record<string, Product> => {
  const storedProducts = localStorage.getItem(
    UPDATED_PRODUCTS_KEY
  );

  if (!storedProducts) {
    return {};
  }

  return JSON.parse(storedProducts);
};

export const saveAddedProduct = (product: Product) => {
  const storedProducts = localStorage.getItem(
    ADDED_PRODUCTS_KEY
  );

  const addedProducts: Product[] = storedProducts
    ? JSON.parse(storedProducts)
    : [];

  addedProducts.push(product);

  localStorage.setItem(
    ADDED_PRODUCTS_KEY,
    JSON.stringify(addedProducts)
  );
};

export const getAddedProducts = (): Product[] => {
  const storedProducts = localStorage.getItem(
    ADDED_PRODUCTS_KEY
  );

  if (!storedProducts) {
    return [];
  }

  return JSON.parse(storedProducts);
};

export const removeAddedProduct = (productId: number) => {
  const storedProducts = localStorage.getItem(
    ADDED_PRODUCTS_KEY
  );

  if (!storedProducts) {
    return;
  }

  const addedProducts: Product[] = JSON.parse(
    storedProducts
  );

  const remainingProducts = addedProducts.filter(
    (product) => product.id !== productId
  );

  localStorage.setItem(
    ADDED_PRODUCTS_KEY,
    JSON.stringify(remainingProducts)
  );
};

export const saveDeletedProduct = (productId: number) => {
  const storedProducts = localStorage.getItem(
    DELETED_PRODUCTS_KEY
  );

  const deletedProducts: number[] = storedProducts
    ? JSON.parse(storedProducts)
    : [];

  if (!deletedProducts.includes(productId)) {
    deletedProducts.push(productId);
  }

  localStorage.setItem(
    DELETED_PRODUCTS_KEY,
    JSON.stringify(deletedProducts)
  );
};

export const getDeletedProducts = (): number[] => {
  const storedProducts = localStorage.getItem(
    DELETED_PRODUCTS_KEY
  );

  if (!storedProducts) {
    return [];
  }

  return JSON.parse(storedProducts);
};