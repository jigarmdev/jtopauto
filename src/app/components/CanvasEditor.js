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

    // Selection callback
    let selectionCallback = () => {};

    fabricCanvas.current.on("selection:created", (e) =>
      selectionCallback(e.selected[0])
    );
    fabricCanvas.current.on("selection:updated", (e) =>
      selectionCallback(e.selected[0])
    );
    fabricCanvas.current.on("selection:cleared", () =>
      selectionCallback(null)
    );

    // Update price on object modification (text change, font change, scale)
    const handleObjectModified = (e) => {
      const obj = e.target;
      if (obj && obj.type === "textbox") {
        selectionCallback(obj); // trigger price recalculation
      }
    };

     // Scaling: update font size based on scale
    fabricCanvas.current.on("object:scaling", (e) => {
      const obj = e.target;
      if (obj && obj.type === "textbox") {
        const newFontSize = Math.round(obj.fontSize * obj.scaleX);
        obj.set({
          fontSize: newFontSize,
          scaleX: 1,
          scaleY: 1,
        });
        obj.setCoords(); // <-- recalculate bounding box
        fabricCanvas.current.renderAll();
        selectionCallback(obj); // update sidebar and price
      }
    });

    fabricCanvas.current.on("object:modified", handleObjectModified);
    fabricCanvas.current.on("object:scaling", handleObjectModified);
    fabricCanvas.current.on("text:changed", handleObjectModified);

    // Delete selected object on Delete/Backspace key
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObject = fabricCanvas.current.getActiveObject();
        if (activeObject && activeObject.type === "textbox") {
          fabricCanvas.current.remove(activeObject);
          fabricCanvas.current.discardActiveObject();
          fabricCanvas.current.renderAll();
          selectionCallback(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Expose API
    setFabricAPI({
      addText: (text, fontSize = 40) => {
        const newText = new fabric.Textbox(text, {
          left: 100,
          top: 100,
          fontSize,
          fontFamily: "Times New Roman",
          fill: "#0c4a6e",
        });
        fabricCanvas.current.add(newText);
        fabricCanvas.current.setActiveObject(newText);
        fabricCanvas.current.renderAll();
        return newText;
      },
      selectObject: (obj) => {
        fabricCanvas.current.setActiveObject(obj);
        fabricCanvas.current.renderAll();
      },
      deleteActiveObject: () => {
        const activeObject = fabricCanvas.current.getActiveObject();
        if (activeObject && activeObject.type === "textbox") {
          fabricCanvas.current.remove(activeObject);
          fabricCanvas.current.discardActiveObject();
          fabricCanvas.current.renderAll();
          selectionCallback(null);
        }
      },
      onSelection: (cb) => {
        selectionCallback = cb;
      },
      getCanvas: () => fabricCanvas.current,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      fabricCanvas.current.dispose();
    };
  }, [setFabricAPI]);

  return <canvas ref={canvasRef} className="border shadow-lg rounded" />;
}
