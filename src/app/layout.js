import "./globals.css";

export const metadata = {
  title: "Text Pricing Calculator",
  description: "Next.js + Fabric.js + Firebase pricing app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
