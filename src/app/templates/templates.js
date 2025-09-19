export const templates = [
  {
    id: 1,
    name: "Business Card",
    width: 2048,
    height: 2048,
    elements: [
      { type: "text", text: "Your Name", x: 200, y: 300, fontSize: 48, color: "#000" },
      { type: "text", text: "Job Title", x: 200, y: 400, fontSize: 32, color: "#666" },
      { type: "text", text: "company@email.com", x: 200, y: 600, fontSize: 28, color: "#333" },
      { type: "text", text: "+1 234 567 8900", x: 200, y: 700, fontSize: 28, color: "#333" }
    ]
  },
  {
    id: 2,
    name: "Flyer Header",
    width: 2048,
    height: 2048,
    elements: [
      { type: "text", text: "SALE 50% OFF", x: 400, y: 800, fontSize: 72, color: "#ff0000" },
      { type: "text", text: "Limited Time Offer", x: 400, y: 1000, fontSize: 36, color: "#333" },
      { type: "text", text: "Visit our store today!", x: 400, y: 1200, fontSize: 32, color: "#666" }
    ]
  },
  {
    id: 3,
    name: "Logo Layout",
    width: 2048,
    height: 2048,
    elements: [
      { type: "text", text: "BRAND", x: 800, y: 900, fontSize: 64, color: "#0066cc" },
      { type: "text", text: "Tagline here", x: 800, y: 1100, fontSize: 28, color: "#999" }
    ]
  }
];