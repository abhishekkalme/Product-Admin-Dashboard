"use client";

import { useState } from "react";
import { loginUser } from "@/api/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser({
        username,
        password,
      });

      localStorage.setItem(
        "token",
        response.accessToken
      );

      router.push("/products");
    } catch (error) {
      console.error(error);
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 border rounded-lg p-6"
      >
        <h1 className="text-2xl font-bold">
          Login
        </h1>

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          className="w-full border rounded px-4 py-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border rounded px-4 py-2"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}