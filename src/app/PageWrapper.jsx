"use client";

import { createContext, useContext, useState } from "react";
import ClientLayout from "./ClientLayout";

const PriceContext = createContext();

export const usePriceContext = () => useContext(PriceContext);

export default function PageWrapper({ children }) {
  const [price, setPrice] = useState(0);

  return (
    <PriceContext.Provider value={{ price, setPrice }}>
      <ClientLayout price={price}>{children}</ClientLayout>
    </PriceContext.Provider>
  );
}