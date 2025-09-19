"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function RightPanel({ fabricAPI }) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [aiPrompt, setAIPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddText = () => {
    if (fabricAPI && text.trim()) {
      fabricAPI.addText(text, fontSize);
      setText("");
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim() || !fabricAPI) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate-hf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();

      if (!data.image) throw new Error("No image returned from AI service");

      const img = new Image();
      img.src = data.image;
      img.onload = () => {
        const fabricImg = new window.fabric.Image(img, {
          left: 100,
          top: 100,
        });
        fabricAPI.getCanvas().add(fabricImg);
      };

      toast.success("AI image generated successfully!");
    } catch (err) {
      console.error("AI image generation error:", err);
      toast.error(
        `Image generation failed: ${err.message}`,
        { closeButton: true }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Image</h3>
      <div className="space-y-2">
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAIPrompt(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Describe image..."
        />
        <button
          onClick={handleGenerateImage}
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}
