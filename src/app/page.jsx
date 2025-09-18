"use client";

import { useState } from "react";
import CanvasEditor from "./components/CanvasEditor";

export default function Page() {
  const [fabricAPI, setFabricAPI] = useState(null);
  const [price, setPrice] = useState(0);
  const [inputText, setInputText] = useState("");
  const [fontSize, setFontSize] = useState(40);

  // Add text via API from CanvasEditor
  const handleAddText = () => {
    if (fabricAPI && inputText) {
      fabricAPI.addText(inputText, fontSize);

      // pricing
      setPrice((fontSize * inputText.length * 2).toFixed(2));
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center">
        {/* CanvasEditor handles all fabric.js logic */}
        <CanvasEditor setFabricAPI={setFabricAPI} />
      </div>

      {/* Sidebar Controls */}
      <aside className="w-80 bg-white border-l shadow-md p-6 space-y-6">
        <h2 className="text-lg font-bold text-sky-700">Controls</h2>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Enter Text</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-1">Font Size</label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 40)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Add Text Button */}
        <button
          onClick={handleAddText}
          className="w-full bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
        >
          Add Text
        </button>

        {/* Pricing */}
        <div className="p-4 bg-sky-50 rounded shadow">
          <p className="text-sm text-gray-500">Pricing</p>
          <p className="text-xl font-bold text-sky-700">₹ {price}</p>
          <p className="text-xs text-gray-400">(based on text size & length)</p>
        </div>
      </aside>
    </div>
  );
}
