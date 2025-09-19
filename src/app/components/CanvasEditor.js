"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";

export default function CanvasEditor({ setFabricAPI }) {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);

  useEffect(() => {
    fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#f0f9ff", // green background
      selection: true,
    });

    // Set fixed high-resolution canvas size
    fabricCanvas.current.setWidth(2048);
    fabricCanvas.current.setHeight(2048);
    fabricCanvas.current.renderAll();

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

    // Scaling + font update
    fabricCanvas.current.on("object:scaling", (e) => {
      const obj = e.target;
      if (obj && obj.type === "textbox") {
        const newFontSize = Math.round(obj.fontSize * obj.scaleX);
        obj.set({ fontSize: newFontSize, scaleX: 1, scaleY: 1 });
        obj.setCoords();
        fabricCanvas.current.renderAll();
        selectionCallback(obj);
      }
    });

    fabricCanvas.current.on("text:changed", (e) => {
      if (e.target.type === "textbox") selectionCallback(e.target);
    });

    // Delete key
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

    // API
    setFabricAPI({
      addText: (text, fontSize = 40, x = 100, y = 100) => {
        const newText = new fabric.Textbox(text, {
          left: x,
          top: y,
          fontSize: fontSize * 2, // Scale for high-res canvas
          fontFamily: "Times New Roman",
          fill: "#0c4a6e",
        });
        fabricCanvas.current.add(newText);
        fabricCanvas.current.setActiveObject(newText);
        fabricCanvas.current.renderAll();
        return newText;
      },
      loadSVG: (svgPath) => {
        fabric.loadSVGFromURL(svgPath, (objects, options) => {
          const svgGroup = fabric.util.groupSVGElements(objects, options);
          
          // Scale to fit canvas
          const canvasWidth = fabricCanvas.current.width;
          const canvasHeight = fabricCanvas.current.height;
          const scaleX = canvasWidth / svgGroup.width;
          const scaleY = canvasHeight / svgGroup.height;
          const scale = Math.min(scaleX, scaleY);
          
          svgGroup.set({
            left: 0,
            top: 0,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true
          });
          
          fabricCanvas.current.add(svgGroup);
          fabricCanvas.current.renderAll();
        });
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

  return (
    <canvas
      ref={canvasRef}
      width={2048}
      height={2048}
      className="border shadow-lg rounded"
      style={{ width: '400px', height: '400px' }}
    />
  );
}
