"use client";

import { useState, useEffect } from "react";
import CanvasEditor from "./components/CanvasEditor";
import RightPanel from "./components/RightPanel.jsx";

export default function Page() {
  const [fabricAPI, setFabricAPI] = useState(null);
  const [price, setPrice] = useState(0);
  const [inputText, setInputText] = useState("");
  const [fontSize, setFontSize] = useState(40);

  // Pricing formula
  const calculatePrice = (text, size) => {
    if (!text) return 0;
    return (size * text.length * 2).toFixed(2); // ₹2 per fontSize*char
  };

  const handleAddText = () => {
    if (fabricAPI && inputText) {
      const obj = fabricAPI.addText(inputText, fontSize);
      setPrice(calculatePrice(inputText, fontSize));
      fabricAPI.selectObject(obj);
    }
  };

  // Update price whenever object changes (text, fontSize, scaling)
  useEffect(() => {
    if (fabricAPI) {
      fabricAPI.onSelection((obj) => {
        if (obj && obj.type === "textbox") {
          const effectiveFontSize = obj.fontSize * obj.scaleX;
          setFontSize(obj.fontSize);
          setPrice(calculatePrice(obj.text, effectiveFontSize));
        } else {
          setPrice(0);
        }
      });
    }
  }, [fabricAPI]);

  // Update selected object's font size on input change
  useEffect(() => {
    if (fabricAPI) {
      const canvas = fabricAPI.getCanvas();
      const activeObj = canvas.getActiveObject();
      if (activeObj && activeObj.type === "textbox") {
        activeObj.set("fontSize", fontSize);
        activeObj.set("scaleX", 1);
        activeObj.set("scaleY", 1);
        activeObj.setCoords();
        canvas.renderAll();
        setPrice(calculatePrice(activeObj.text, fontSize));
      }
    }
  }, [fontSize, fabricAPI]);

  return (
    <div className="flex w-full h-screen">
      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <CanvasEditor setFabricAPI={setFabricAPI} />
      </div>

      {/* Sidebar Controls */}
      <aside className="w-80 bg-white border-l shadow-md p-6 space-y-6 overflow-y-auto">
        {/* Existing text controls */}
        <div>
          <h2 className="text-lg font-bold text-sky-700 mb-2">Text Controls</h2>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-2"
            placeholder="Enter text..."
          />
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 40)}
            className="w-full border rounded px-3 py-2 mb-2"
            placeholder="Font size"
          />
          <button
            onClick={handleAddText}
            className="w-full bg-sky-600 text-white px-4 py-2 rounded mb-2"
          >
            Add Text
          </button>
        </div>

        {/* Price display */}
        <div className="p-4 bg-sky-50 rounded shadow mb-4">
          <p className="text-sm text-gray-500">Selected Text Price</p>
          <p className="text-xl font-bold text-sky-700">₹ {price}</p>
          <p className="text-xs text-gray-400">(based on text size & length)</p>
        </div>

        {/* RightPanel for AI image + additional controls */}
        <RightPanel fabricAPI={fabricAPI} />
      </aside>
    </div>
  );
}
