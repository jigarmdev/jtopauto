import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientLayout from "./ClientLayout";
import PageWrapper from "./PageWrapper";

export const metadata = {
  title: "W2P Designer",
  description: "Web2Print Designer with Fabric.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-sky-50 text-gray-800 h-screen overflow-hidden">
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
