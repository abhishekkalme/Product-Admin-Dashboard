"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts, Product, searchProducts } from "@/api/products";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(20);

  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        const skip = (page - 1) * limit;

        const data = searchQuery
          ? await searchProducts(searchQuery, limit, skip, controller.signal)
          : await getProducts(limit, skip, controller.signal);

        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [router, page, limit, searchQuery]);

  const totalPages = Math.ceil(total / limit);

  const start = total === 0 ? 0 : (page - 1) * limit + 1;

  const end = Math.min(page * limit, total);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
          className="border rounded px-4 py-2 w-full max-w-md"
        />
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Rating</th>
              <th className="p-4 text-left">Stock</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-4">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>

                <td className="p-4">{product.title}</td>

                <td className="p-4">{product.category}</td>

                <td className="p-4">${product.price}</td>

                <td className="p-4">⭐ {product.rating}</td>

                <td className="p-4">{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-24 h-24 object-cover rounded mb-4"
            />

            <h2 className="font-semibold text-lg">{product.title}</h2>

            <p>Category: {product.category}</p>

            <p>Price: ${product.price}</p>

            <p>Rating: ⭐ {product.rating}</p>

            <p>Stock: {product.stock}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <p>
          Showing {start}–{end} of {total}
        </p>

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="border rounded px-3 py-2"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="border px-3 py-2 rounded"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;

          return (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className="border px-3 py-2 rounded"
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="border px-3 py-2 rounded"
        >
          Next
        </button>
      </div>
    </main>
  );
}
