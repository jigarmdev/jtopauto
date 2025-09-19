import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const modelsDir = path.join(process.cwd(), "public/models");
    
    if (!fs.existsSync(modelsDir)) {
      return NextResponse.json({ models: [] });
    }
    
    const files = fs.readdirSync(modelsDir);
    const modelFiles = files.filter(file => {
      const ext = file.toLowerCase();
      return ext.endsWith('.glb') || ext.endsWith('.gltf') || 
             ext.endsWith('.fbx') || ext.endsWith('.obj') ||
             ext.includes('.drc.glb');
    });
    
    const models = modelFiles.map(file => ({
      name: file.replace(/\.(glb|gltf|fbx|obj|drc\.glb)$/i, ''),
      file: file
    }));
    
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error reading models directory:', error);
    return NextResponse.json({ models: [] });
  }
}