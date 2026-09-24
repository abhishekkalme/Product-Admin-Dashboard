"use client";

import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts,Product } from "@/api/products";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProducts = async () => {
      const data = await getProducts(20, 0);

      setProducts(data.products);
    };

    fetchProducts();
  }, [router]);

  return (
  <main className="p-6">
    <h1 className="text-2xl font-bold mb-6">
      Products
    </h1>

    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="border rounded-lg p-4"
        >
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-24 h-24 object-cover"
          />

          <h2 className="font-semibold">
            {product.title}
          </h2>

          <p>Category: {product.category}</p>

          <p>Price: ${product.price}</p>

          <p>Rating: {product.rating}</p>

          <p>Stock: {product.stock}</p>
        </div>
      ))}
    </div>
  </main>
);
}