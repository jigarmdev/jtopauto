"use client";

import { useState, useEffect } from "react";
import CanvasEditor from "./components/CanvasEditor";
import RightPanel from "./components/RightPanel.jsx";
import ThreeCanvas from "./components/ThreeCanvas"; // new three.js component
import TemplateSelector from "./components/TemplateSelector";
import ModelSelector from "./components/ModelSelector";
import { usePriceContext } from "./PageWrapper";

export default function Page() {
  const [fabricAPI, setFabricAPI] = useState(null);
  const { price, setPrice } = usePriceContext();
  const [inputText, setInputText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [selectedUV, setSelectedUV] = useState(null);
  const [selectedModel, setSelectedModel] = useState("women sports.glb");
  const [activePanel, setActivePanel] = useState(null);

  // Pricing formula
  const calculatePrice = (text, size) => {
    if (!text) return 0;
    return (size * text.length * 2).toFixed(2);
  };

  const handleAddText = () => {
    if (fabricAPI && inputText) {
      if (!selectedUV) {
        alert('Please select a position on the 3D model first');
        return;
      }
      const obj = fabricAPI.addText(inputText, fontSize, selectedUV.x, selectedUV.y);
      setPrice(calculatePrice(inputText, fontSize));
      fabricAPI.selectObject(obj);
      setSelectedUV(null); // Reset after use
    }
  };

  // Selection listener
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

  // Font size sync
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

  // Icon Panel
  const IconPanel = (
    <div className="flex flex-col gap-2">
      {/* Text Control Icon */}
      <button
        onClick={() => setActivePanel(activePanel === 'text' ? null : 'text')}
        className={`p-3 rounded-lg transition-colors ${
          activePanel === 'text' ? 'bg-sky-600 text-white' : 'bg-white text-sky-600 hover:bg-sky-50'
        } shadow-sm border border-sky-200`}
        title="Text Controls"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 4v3h5.5v12h3V7H19V4z"/>
        </svg>
      </button>

      {/* Image Control Icon */}
      <button
        onClick={() => setActivePanel(activePanel === 'image' ? null : 'image')}
        className={`p-3 rounded-lg transition-colors ${
          activePanel === 'image' ? 'bg-sky-600 text-white' : 'bg-white text-sky-600 hover:bg-sky-50'
        } shadow-sm border border-sky-200`}
        title="AI Image"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      </button>

      {/* Template Control Icon */}
      <button
        onClick={() => setActivePanel(activePanel === 'template' ? null : 'template')}
        className={`p-3 rounded-lg transition-colors ${
          activePanel === 'template' ? 'bg-sky-600 text-white' : 'bg-white text-sky-600 hover:bg-sky-50'
        } shadow-sm border border-sky-200`}
        title="Templates"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
      </button>
    </div>
  );

  // Popup Panel Content
  const PopupContent = () => {
    if (activePanel === 'text') {
      return (
        <div className="bg-white rounded-lg p-4 shadow-lg border border-sky-200 w-80 relative">
          <button
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ×
          </button>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pr-6">Add Text</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Enter text..."
            />
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 40)}
                className="w-20 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Size"
              />
              <button
                onClick={handleAddText}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                  selectedUV 
                    ? 'bg-sky-600 text-white hover:bg-sky-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!selectedUV}
              >
                Add
              </button>
            </div>
            {selectedUV && (
              <p className="text-xs text-sky-600">
                Position: {Math.round(selectedUV.x)}, {Math.round(selectedUV.y)}
              </p>
            )}
          </div>
        </div>
      );
    }
    
    if (activePanel === 'image') {
      return (
        <div className="bg-white rounded-lg p-4 shadow-lg border border-sky-200 w-80 relative">
          <button
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ×
          </button>
          <div className="pr-6">
            <RightPanel fabricAPI={fabricAPI} />
          </div>
        </div>
      );
    }
    
    if (activePanel === 'template') {
      return (
        <div className="bg-white rounded-lg p-4 shadow-lg border border-sky-200 w-80 relative">
          <button
            onClick={() => setActivePanel(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ×
          </button>
          <div className="pr-6">
            <TemplateSelector fabricAPI={fabricAPI} />
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Mobile Controls Panel
  const MobileControlsPanel = (
    <div className="space-y-4">
      {/* Text Controls */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-sky-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Text</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="Enter text..."
          />
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 40)}
              className="w-20 border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Size"
            />
            <button
              onClick={handleAddText}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
                selectedUV 
                  ? 'bg-sky-600 text-white hover:bg-sky-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!selectedUV}
            >
              Add
            </button>
          </div>
          {selectedUV && (
            <p className="text-xs text-sky-600">
              Position: {Math.round(selectedUV.x)}, {Math.round(selectedUV.y)}
            </p>
          )}
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-sky-200">
        <TemplateSelector fabricAPI={fabricAPI} />
      </div>

      {/* AI Panel */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-sky-200">
        <RightPanel fabricAPI={fabricAPI} />
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-full w-full pb-20 overflow-hidden">
        {/* Canvas Section */}
        <div className="flex-1 flex items-center justify-center bg-gray-200 relative" style={{ display: 'flex', flexWrap: 'wrap' }}>
          
          {/* Three.js Canvas (visible) */}
          <ThreeCanvas 
            fabricAPI={fabricAPI} 
            onUVSelect={setSelectedUV} 
            selectedUV={selectedUV}
            modelFile={selectedModel}
          />

          {/* Fabric.js Canvas (hidden but active for texture) */}
          <div className="opacity-0 pointer-events-none">
            <CanvasEditor setFabricAPI={setFabricAPI} />
          </div>

          {/* Mobile floating button */}
          <button
            onClick={() => setIsMobilePanelOpen(true)}
            className="lg:hidden absolute bottom-4 right-4 bg-sky-600 text-white px-4 py-2 rounded-full shadow-lg"
          >
            Controls
          </button>
        </div>

        {/* Sidebar (desktop only) */}
        <aside className="w-16 p-2 h-full bg-gray-100">
          {IconPanel}
        </aside>
      </div>

      {/* Mobile Bottom Drawer */}
      {isMobilePanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end lg:hidden z-50">
          <div className="w-full bg-white p-6 rounded-t-2xl shadow-lg max-h-[75vh] overflow-y-auto relative">
            <button
              onClick={() => setIsMobilePanelOpen(false)}
              className="absolute top-2 right-4 text-gray-600 font-bold"
            >
              ✕
            </button>
            {MobileControlsPanel}
          </div>
        </div>
      )}

      {/* Floating Menu */}
      {activePanel && (
        <div className="fixed right-20 top-20 z-50">
          <PopupContent />
        </div>
      )}

      {/* Model Selector */}
      <ModelSelector onModelSelect={setSelectedModel} selectedModel={selectedModel} />
    </>
  );
}
