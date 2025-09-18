import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "W2P Designer",
  description: "Web2Print Designer with Fabric.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-sky-50 text-gray-800">
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m6-6H6"
              />
            </svg>
            <h1 className="text-xl font-semibold">W2P Designer</h1>
          </div>
        </header>

        <main className="flex h-[calc(100vh-64px)]">
          <section className="flex-1 flex items-center justify-center p-6 bg-sky-50">
            {children}
          </section>
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
      </body>
    </html>
  );
}
