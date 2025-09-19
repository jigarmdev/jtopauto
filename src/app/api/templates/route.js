import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), "public/templates");
    
    if (!fs.existsSync(templatesDir)) {
      return NextResponse.json({ templates: [] });
    }
    
    const files = fs.readdirSync(templatesDir);
    const svgFiles = files.filter(file => file.toLowerCase().endsWith('.svg'));
    
    const templates = svgFiles.map(file => ({
      name: file.replace('.svg', ''),
      file: file,
      path: `/templates/${file}`
    }));
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error reading templates directory:', error);
    return NextResponse.json({ templates: [] });
  }
}