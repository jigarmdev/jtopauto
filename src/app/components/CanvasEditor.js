"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";

export default function CanvasEditor({ setFabricAPI }) {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

  useEffect(() => {
    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "#f0f9ff",
    });

    setFabricAPI({
      addText: (text, fontSize = 40) => {
        const newText = new fabric.Textbox(text, {
          left: 100,
          top: 100,
          fontSize,
          fontFamily: "Times New Roman",
          fill: "#0c4a6e", // Deep blue text
        });
        fabricCanvas.current.add(newText)
        fabricCanvas.current.setActiveObject(newText);
        fabricCanvas.current.renderAll();
      },
      getCanvas: () => fabricCanvas.current,
    });

    return () => {
      fabricCanvas.current.dispose();
    };
  }, [setFabricAPI]);

  return <canvas ref={canvasRef} className="border shadow-lg rounded" />;
}
