'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function Home() {
  const [markdown, setMarkdown] = useState('');

  const handleMarkdownChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, []);

  const handleConvertToPDF = async () => {
    const element = document.getElementById('markdown-content');
    if (!element) return;

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Create a version that maintains structure but uses compatible colors
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '800px';
      pdfContainer.style.padding = '40px';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.color = '#000000';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.fontSize = '16px';
      pdfContainer.style.lineHeight = '1.5';
      
      // Copy the HTML structure but with simplified colors
      pdfContainer.innerHTML = element.innerHTML
        .replace(/text-gray-\d+/g, 'text-black')
        .replace(/text-blue-\d+/g, 'text-blue-600')
        .replace(/text-purple-\d+/g, 'text-purple-600')
        .replace(/bg-gray-\d+/g, 'bg-gray-100')
        .replace(/border-gray-\d+/g, 'border-gray-200');

      // Add KaTeX styles
      const katexStyles = document.querySelector('link[href*="katex"]');
      if (katexStyles) {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          .katex { font-size: 1.1em; }
          .katex-display { margin: 1em 0; }
          .katex-display > .katex { display: inline-block; text-align: center; }
          .katex-display > .katex > .katex-html { display: block; position: relative; }
          .katex-display > .katex > .katex-html > .tag { position: absolute; right: 0; }
        `;
        pdfContainer.appendChild(styleSheet);
      }

      // Add basic prose styles
      pdfContainer.style.maxWidth = 'none';
      pdfContainer.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        (h as HTMLElement).style.color = '#000000';
        (h as HTMLElement).style.fontWeight = 'bold';
      });
      pdfContainer.querySelectorAll('p').forEach(p => {
        (p as HTMLElement).style.color = '#000000';
      });
      pdfContainer.querySelectorAll('a').forEach(a => {
        (a as HTMLElement).style.color = '#0645AD';
      });
      pdfContainer.querySelectorAll('code').forEach(code => {
        (code as HTMLElement).style.color = '#7c3aed';
        (code as HTMLElement).style.backgroundColor = '#f5f5f5';
      });
      pdfContainer.querySelectorAll('pre').forEach(pre => {
        (pre as HTMLElement).style.backgroundColor = '#f5f5f5';
        (pre as HTMLElement).style.padding = '1rem';
        (pre as HTMLElement).style.borderRadius = '0.375rem';
      });

      // Ensure KaTeX is properly rendered
      const katexScript = document.createElement('script');
      katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      document.body.appendChild(katexScript);

      // Wait for KaTeX to load and render
      await new Promise((resolve) => {
        katexScript.onload = resolve;
      });

      document.body.appendChild(pdfContainer);

      // Wait a bit for KaTeX to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(pdfContainer, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
        allowTaint: true,
        imageTimeout: 0,
        removeContainer: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
        compress: true
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
      pdf.save('markdown-document.pdf');
      
      document.body.removeChild(pdfContainer);
      document.body.removeChild(katexScript);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Memoize the markdown preview to prevent unnecessary re-renders
  const markdownPreview = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {markdown}
    </ReactMarkdown>
  ), [markdown]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Markdown to PDF Converter
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-400">
            Convert your Markdown documents to beautifully formatted PDFs
          </p>
          <p className="mt-2 text-sm text-gray-500">by TheManas</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200">Markdown Input</h2>
            </div>
            <div className="p-6">
              <textarea
                className="w-full min-h-[200px] p-4 text-gray-200 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                value={markdown}
                onChange={handleMarkdownChange}
                placeholder="Paste your Markdown here...&#10;&#10;Example:&#10;# Heading&#10;## Subheading&#10;&#10;You can use **bold** and *italic* text.&#10;&#10;Math equations:&#10;Inline math: $E = mc^2$&#10;Block math:&#10;$$\frac{d}{dx}e^x = e^x$$"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
            </div>
            <div className="p-6">
              <div 
                id="markdown-content"
                className="w-full min-h-[200px] p-6 bg-white rounded-lg border border-gray-200 overflow-auto prose prose-lg max-w-none"
                style={{ 
                  color: '#111111',
                  background: '#ffffff',
                  '--tw-prose-body': '#111111',
                  '--tw-prose-headings': '#000000',
                  '--tw-prose-links': '#0645AD',
                  '--tw-prose-bold': '#000000',
                  '--tw-prose-code': '#7c3aed',
                  '--tw-prose-pre-bg': '#f5f5f5'
                } as React.CSSProperties}
              >
                {markdownPreview}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleConvertToPDF}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Convert to PDF
          </button>
        </div>
      </div>
    </main>
  );
}
