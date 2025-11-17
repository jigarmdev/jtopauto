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
    
    // Make canvas transparent to mouse events and prevent focus
    fabricCanvas.current.upperCanvasEl.style.pointerEvents = 'none';
    fabricCanvas.current.lowerCanvasEl.style.pointerEvents = 'none';
    fabricCanvas.current.upperCanvasEl.tabIndex = -1;
    fabricCanvas.current.lowerCanvasEl.tabIndex = -1;

    // Set fixed high-resolution canvas size
    fabricCanvas.current.setWidth(2048);
    fabricCanvas.current.setHeight(2048);
    fabricCanvas.current.renderAll();






    // Selection callback with pointer events management
    let selectionCallback = () => {};
    fabricCanvas.current.on("selection:created", (e) => {
      fabricCanvas.current.upperCanvasEl.style.pointerEvents = 'auto';
      fabricCanvas.current.lowerCanvasEl.style.pointerEvents = 'auto';
      selectionCallback(e.selected[0]);
    });
    fabricCanvas.current.on("selection:updated", (e) => {
      selectionCallback(e.selected[0]);
    });
    fabricCanvas.current.on("selection:cleared", () => {
      fabricCanvas.current.upperCanvasEl.style.pointerEvents = 'none';
      fabricCanvas.current.lowerCanvasEl.style.pointerEvents = 'none';
      selectionCallback(null);
    });

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
          originX: 'center',
          originY: 'center'
        });
        fabricCanvas.current.add(newText);
        fabricCanvas.current.setActiveObject(newText);
        fabricCanvas.current.renderAll();
        return newText;
      },
      loadSVG: (svgUrl) => {
        // Remove existing SVG groups
        const existingSVGs = fabricCanvas.current.getObjects().filter(obj => 
          obj.type === 'group' && !obj.selectable
        );
        existingSVGs.forEach(svg => fabricCanvas.current.remove(svg));
        
        fabric.loadSVGFromURL(svgUrl).then((result) => {
          const { objects, options } = result;
          if (!objects || objects.length === 0) return;
          
          // Make all objects completely non-interactive
          objects.forEach(obj => {
            obj.set({
              selectable: false,
              evented: false,
              hasControls: false,
              hasBorders: false,
              lockMovementX: true,
              lockMovementY: true,
              lockRotation: true,
              lockScalingX: true,
              lockScalingY: true
            });
          });
          
          const svgGroup = new fabric.Group(objects, options);
          
          const scaleX = 2048 / svgGroup.width;
          const scaleY = 2048 / svgGroup.height;
          
          svgGroup.set({
            left: 0,
            top: 0,
            scaleX: scaleX,
            scaleY: scaleY,
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true
          });
          
          fabricCanvas.current.add(svgGroup);
          fabricCanvas.current.sendObjectToBack(svgGroup);
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
      setPositionFunction: (positionFn) => {
        window.getPositionOnScene = positionFn;
      },
      enablePointerEvents: () => {
        fabricCanvas.current.upperCanvasEl.style.pointerEvents = 'auto';
        fabricCanvas.current.lowerCanvasEl.style.pointerEvents = 'auto';
      },
      disablePointerEvents: () => {
        fabricCanvas.current.upperCanvasEl.style.pointerEvents = 'none';
        fabricCanvas.current.lowerCanvasEl.style.pointerEvents = 'none';
      },
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
      tabIndex={-1}
      className="border shadow-lg rounded"
      style={{ 
        width: '400px', 
        height: '400px',
        pointerEvents: 'none'
      }}
    />
  );
}
