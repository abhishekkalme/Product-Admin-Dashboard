"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, Product, updateProduct } from "@/api/products";
import { saveUpdatedProduct } from "@/utils/productStorage";

export default function EditProductPage() {
  const params = useParams();

  const router = useRouter();

  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const data = await getProductById(id, controller.signal);

        setProduct(data);

        setTitle(data.title);
        setPrice(String(data.price));
        setCategory(data.category);
        setStock(String(data.stock));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (!product) {
    return (
      <main className="p-6">
        <p>Loading product...</p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setError("");
    setIsLoading(true);

    if (!title.trim()) {
      setError("Product title is required");
      setIsLoading(false);
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0");
      setIsLoading(false);
      return;
    }

    if (!category.trim()) {
      setError("Category is required");
      setIsLoading(false);
      return;
    }

    if (!stock || Number(stock) < 0) {
      setError("Stock must be 0 or greater");
      setIsLoading(false);
      return;
    }

    try {
      const updatedProduct = await updateProduct(id, {
        title: title.trim(),
        price: Number(price),
        category: category.trim(),
        stock: Number(stock),
      });

      saveUpdatedProduct(updatedProduct);

      router.push("/products");
    } catch (error) {
      console.error(error);
      setError("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
