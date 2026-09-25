import api from "./axios";

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  description: string;
  images: string[];
  reviews: ProductReview[];
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface CreateProductData {
  title: string;
  price: number;
  category: string;
  stock: number;
}

export interface UpdateProductData {
  title: string;
  price: number;
  category: string;
  stock: number;
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

export const getProductById = async (
  id: number,
  signal?: AbortSignal
): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`, {
    signal,
  });

  return response.data;
};

export const createProduct = async (
  data: CreateProductData
): Promise<Product> => {
  const response = await api.post<Product>("/products/add", data);

  return response.data;
};