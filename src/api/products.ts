import api from "./axios";

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export const getProducts = async (
  limit: number,
  skip: number,
   sortBy?: string,
  order?: string,
  signal?: AbortSignal
) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
      sortBy,
      order,
    },
    signal,
  });

  return response.data;
};

export const searchProducts = async (
  query: string,
  limit: number,
  skip: number,
  signal?: AbortSignal
) => {
  const response = await api.get("/products/search", {
    params: {
      q: query,
      limit,
      skip,
    },
    signal,
  });

  return response.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/products/categories");

  return response.data;
};

export const getProductsByCategory = async (
  category: string,
  limit: number,
  skip: number,
  sortBy?: string,
  order?: string,
  signal?: AbortSignal
) => {
  const response = await api.get(`/products/category/${category}`, {
    params: {
      limit,
      skip,
      sortBy,
      order,
    },
    signal,
  });

  return response.data;
};
