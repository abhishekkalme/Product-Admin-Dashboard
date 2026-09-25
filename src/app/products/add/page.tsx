"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/api/products";

export default function AddProductPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      const product = await createProduct({
        title: title.trim(),
        price: Number(price),
        category: category.trim(),
        stock: Number(stock),
      });

      console.log("Created product:", product);

      router.push("/products");
    } catch (error) {
      console.error(error);
      setError("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </main>
  );
}
