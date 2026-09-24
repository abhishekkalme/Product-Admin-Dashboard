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

export const getProducts = async (
  limit: number,
  skip: number,
  signal?: AbortSignal
) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
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
