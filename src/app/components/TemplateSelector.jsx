"use client";

import { useState, useEffect } from "react";
import * as fabric from "fabric";

export default function TemplateSelector({ fabricAPI }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates([]);
      }
    };
    
    loadTemplates();
  }, []);

  const loadSVGTemplate = (template) => {
    if (!fabricAPI) {
      console.error('fabricAPI not available');
      return;
    }
    
    const fullUrl = `${window.location.origin}${template.path}`;
    console.log('Loading SVG template:', template, 'Full URL:', fullUrl);
    
    // Test if URL is accessible
    fetch(fullUrl)
      .then(response => {
        console.log('SVG fetch response:', response.status, response.statusText);
        if (response.ok) {
          fabricAPI.loadSVG(fullUrl);
        } else {
          console.error('SVG not accessible:', response.status);
        }
      })
      .catch(error => {
        console.error('Error fetching SVG:', error);
      });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">SVG Templates</h3>
      <div className="space-y-2">
        {templates.length === 0 ? (
          <p className="text-xs text-gray-500">No templates found</p>
        ) : (
          templates.map((template, index) => (
            <button
              key={index}
              onClick={() => loadSVGTemplate(template)}
              className="w-full p-3 border border-gray-200 rounded-md hover:bg-sky-50 hover:border-sky-300 text-left text-sm transition-colors"
            >
              <div className="font-medium text-gray-800">{template.name}</div>
              <div className="text-xs text-gray-500">SVG Template</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}