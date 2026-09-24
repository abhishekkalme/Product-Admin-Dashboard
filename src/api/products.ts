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
  skip: number
) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};