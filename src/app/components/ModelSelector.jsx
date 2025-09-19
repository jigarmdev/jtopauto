"use client";

import { useState, useEffect } from "react";

export default function ModelSelector({ onModelSelect, selectedModel }) {
  const [models, setModels] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Dynamically load models from API
    const loadModels = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        setModels(data.models || []);
      } catch (error) {
        console.error('Error loading models:', error);
        // Fallback to static list
        setModels([
          { name: "Sample Model", file: "sample.glb" },
          { name: "T-Shirt Model", file: "781001.drc.glb" },
        ]);
      }
    };
    
    loadModels();
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 bg-sky-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-sky-700 transition-colors z-50"
      >
        Products
      </button>

      {/* Bottom Panel */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl p-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">Select 3D Model</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {models.map((model, index) => (
              <button
                key={index}
                onClick={() => {
                  onModelSelect(model.file);
                  setIsOpen(false);
                }}
                className={`flex-shrink-0 p-2 text-center min-w-[80px] rounded-lg transition-colors ${
                  selectedModel === model.file ? 'bg-sky-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-1 rounded-full shadow-lg bg-white flex items-center justify-center transition-colors ${
                  selectedModel === model.file ? 'bg-sky-50' : ''
                }`}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                    className="text-sky-600"
                  >
                    <path d="M30 25 L35 20 L65 20 L70 25 L85 30 L85 45 L80 45 L80 85 L20 85 L20 45 L15 45 L15 30 Z" />
                  </svg>
                </div>
                <div className="text-xs font-medium text-gray-700">{model.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}