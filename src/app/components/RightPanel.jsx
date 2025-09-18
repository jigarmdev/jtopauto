"use client";

import { useState } from "react";

export default function RightPanel({ fabricAPI }) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(40);

  const handleAddText = () => {
    if (fabricAPI && text.trim()) {
      fabricAPI.addText(text, fontSize);
      setText("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-sky-800">Controls</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Text
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter your text..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size
        </label>
        <input
          type="number"
          value={fontSize}
          min="10"
          max="200"
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleAddText}
        className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
      >
        Add to Canvas
      </button>
    </div>
  );
}
