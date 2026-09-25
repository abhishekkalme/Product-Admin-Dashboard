"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getProducts,
  Product,
  searchProducts,
  getCategories,
  getProductsByCategory,
  Category,
} from "@/api/products";

export default function ProductsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get("page");
    const pageNumber = Number(pageParam);

    if (Number.isInteger(pageNumber) && pageNumber > 0) {
      return pageNumber;
    }

    return 1;
  });

  const [limit, setLimit] = useState(() => {
    const limitParam = searchParams.get("limit");
    const limitNumber = Number(limitParam);

    if ([10, 20, 50].includes(limitNumber)) {
      return limitNumber;
    }

    return 20;
  });

  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState(() => {
    return searchParams.get("search") || "";
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("search") || "";
  });

  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get("category") || "";
  });

  const [sortBy, setSortBy] = useState(() => {
    const value = searchParams.get("sort");

    if (["title", "price", "rating"].includes(value || "")) {
      return value || "";
    }

    return "";
  });

  const [order, setOrder] = useState(() => {
    const value = searchParams.get("order");

    if (["asc", "desc"].includes(value || "")) {
      return value || "";
    }

    return "";
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
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

        let data;

        if (searchQuery) {
          data = await searchProducts(
            searchQuery,
            limit,
            skip,
            controller.signal
          );
        } else if (selectedCategory) {
          data = await getProductsByCategory(
            selectedCategory,
            limit,
            skip,
            sortBy,
            order,
            controller.signal
          );
        } else {
          data = await getProducts(
            limit,
            skip,
            sortBy,
            order,
            controller.signal
          );
        }

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
  }, [router, page, limit, searchQuery, selectedCategory, sortBy, order]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, []);

  const totalPages = Math.ceil(total / limit);

  const start = total === 0 ? 0 : (page - 1) * limit + 1;

  const end = Math.min(page * limit, total);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>

        <button
          onClick={() => router.push("/products/add")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;

            setSearchInput(value);
            setPage(1);

            const params = new URLSearchParams(searchParams.toString());

            if (value) {
              params.set("search", value);
            } else {
              params.delete("search");
            }

            params.set("page", "1");

            router.replace(`/products?${params.toString()}`);
          }}
          className="border rounded px-4 py-2 w-full max-w-md"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            const value = e.target.value;

            setSelectedCategory(value);
            setPage(1);

            const params = new URLSearchParams(searchParams.toString());

            if (value) {
              params.set("category", value);
            } else {
              params.delete("category");
            }

            params.set("page", "1");

            router.replace(`/products?${params.toString()}`);
          }}
          className="border rounded px-4 py-2"
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <select
        value={sortBy}
        onChange={(e) => {
          const value = e.target.value;

          setSortBy(value);
          setPage(1);

          const params = new URLSearchParams(searchParams.toString());

          if (value) {
            params.set("sort", value);
          } else {
            params.delete("sort");
          }

          params.set("page", "1");

          router.replace(`/products?${params.toString()}`);
        }}
        className="border rounded px-4 py-2"
      >
        <option value="">Sort By</option>
        <option value="title">Title</option>
        <option value="price">Price</option>
        <option value="rating">Rating</option>
      </select>

      <select
        value={order}
        onChange={(e) => {
          const value = e.target.value;

          setOrder(value);
          setPage(1);

          const params = new URLSearchParams(searchParams.toString());

          if (value) {
            params.set("order", value);
          } else {
            params.delete("order");
          }

          params.set("page", "1");

          router.replace(`/products?${params.toString()}`);
        }}
        className="border rounded px-4 py-2"
      >
        <option value="">Order</option>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
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

                <td className="px-4 py-3">
                  <button
                    onClick={() => router.push(`/products/${product.id}/edit`)}
                    className="border px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                </td>
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

            <button
              onClick={() => router.push(`/products/${product.id}/edit`)}
              className="border px-3 py-1 rounded"
            >
              Edit
            </button>
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
            const newLimit = Number(e.target.value);

            setLimit(newLimit);
            setPage(1);

            const params = new URLSearchParams(searchParams.toString());

            params.set("limit", String(newLimit));
            params.set("page", "1");

            router.replace(`/products?${params.toString()}`);
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
          onClick={() => {
            const newPage = page - 1;

            setPage(newPage);

            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(newPage));

            router.replace(`/products?${params.toString()}`);
          }}
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
              onClick={() => {
                setPage(pageNumber);

                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(pageNumber));

                router.replace(`/products?${params.toString()}`);
              }}
              className="border px-3 py-2 rounded"
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={() => {
            const newPage = page + 1;

            setPage(newPage);

            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(newPage));

            router.replace(`/products?${params.toString()}`);
          }}
          disabled={page === totalPages}
          className="border px-3 py-2 rounded"
        >
          Next
        </button>
      </div>
    </main>
  );
}
