"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

export default function ClientLayout({ children, price = 0 }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <header className="w-full bg-sky-700 text-white px-6 py-3 flex items-center justify-between shadow">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
          </svg>
          <h1 className="text-xl font-semibold">W2P Designer</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm opacity-80">Price</div>
            <div className="text-lg font-bold">₹ {price}</div>
          </div>
          <button className="bg-white text-sky-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
            Add to Cart
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="h-[calc(100vh-64px)] w-full flex flex-col md:flex-row overflow-hidden">
        {children}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
