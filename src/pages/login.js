import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const admin = JSON.parse(localStorage.getItem("user"));
      if (admin) {
        axios
          .post("http://18.215.243.4:3000/user/isAdmin", {
            headers: {
              login: admin?.login,
              password: admin?.password,
            },
          })
          .then((res) => {
            if (res.data) {
              console.log(res.data);
              router.push("/dashboard");
            }
          })
          .catch((err) => {
            console.error("Failed to fetch user:", err);
          });
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("//18.215.243.4:3000/user/isAdmin", {
        login: email,
        password,
      })
      .then((res) => {
        if (!res.data) {
          setError("Something Went Wrong, Please Try Again");
        } else {
          localStorage.setItem(
            "user",
            JSON.stringify({
              password,
              login: email,
            })
          );
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        setError("Something Went Wrong, Please Try Again");
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="text-red-600">{error}</div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
