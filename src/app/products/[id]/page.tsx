"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductById, Product } from "@/api/products";
import { getUpdatedProducts } from "@/utils/productStorage";

export default function ProductDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const data = await getProductById(
          id,
          controller.signal
        );

        const updatedProducts = getUpdatedProducts();

        const localProduct = updatedProducts[String(id)];

        const productWithUpdate = localProduct
          ? { ...data, ...localProduct }
          : data;

        setProduct(productWithUpdate);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);
        setError("Product not found");
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">
          Product Not Found
        </h1>

        <p className="mt-2 text-gray-600">
          The product you are looking for does not exist.
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="p-6">
        <p className="text-gray-600">
          Loading product...
        </p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full max-w-md mx-auto rounded-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {product.title}
          </h1>

          <p className="mt-4 text-gray-600">
            {product.description}
          </p>

          <p className="mt-6 text-2xl font-bold">
            ${product.price}
          </p>

          <p className="mt-2">
            Category: {product.category}
          </p>

          <p>Rating: {product.rating}</p>

          <p>Stock: {product.stock}</p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">
            Reviews
          </h2>

          <div className="space-y-4">
            {product.reviews.map((review, index) => (
              <div
                key={index}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold">
                    {review.reviewerName}
                  </h3>

                  <span>
                    ⭐ {review.rating}/5
                  </span>
                </div>

                <p className="mt-2 text-gray-600">
                  {review.comment}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  {new Date(
                    review.date
                  ).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}