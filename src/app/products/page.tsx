"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getProducts,
  Product,
  searchProducts,
  getCategories,
  getProductsByCategory,
  Category,
  deleteProduct,
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

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [deleteError, setDeleteError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError("");

      try {
        const skip = (page - 1) * limit;

        let data;

        if (searchQuery) {
          data = await searchProducts(searchQuery, limit, skip, signal);
        } else if (selectedCategory) {
          data = await getProductsByCategory(
            selectedCategory,
            limit,
            skip,
            sortBy,
            order,
            signal
          );
        } else {
          data = await getProducts(limit, skip, sortBy, order, signal);
        }

        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        console.error(error);
        setError("Failed to load products");
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [page, limit, searchQuery, selectedCategory, sortBy, order]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [router, fetchProducts]);

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

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    if (deletingId !== null) {
      return;
    }

    setDeletingId(id);
    setDeleteError("");

    try {
      await deleteProduct(id);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error(error);
      setDeleteError("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/products/add")}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Add Product
          </button>

          <button onClick={handleLogout} className="rounded border px-4 py-2">
            Logout
          </button>
        </div>
      </div>
      {deleteError && <p className="mb-4 text-red-600">{deleteError}</p>}
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
      {isLoading ? (
        <div className="py-10 text-center">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-red-600">{error}</p>

          <button
            onClick={() => fetchProducts()}
            className="mt-4 border px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-600">No products found.</p>
        </div>
      ) : (
        <>
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
                        onClick={() =>
                          router.push(`/products/${product.id}/edit`)
                        }
                        className="border px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId !== null}
                        className="border border-red-500 text-red-500 px-3 py-1 rounded disabled:opacity-50"
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
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
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId !== null}
                  className="border border-red-500 text-red-500 px-3 py-1 rounded disabled:opacity-50"
                >
                  {deletingId === product.id ? "Deleting..." : "Delete"}
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
        </>
      )}
    </main>
  );
}
