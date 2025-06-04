'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function Home() {
  const [markdown, setMarkdown] = useState('');

  const handleConvertToPDF = async () => {
    const element = document.getElementById('markdown-content');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: 'markdown-document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

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
                className="w-full h-[600px] p-4 text-gray-200 bg-gray-900 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Paste your Markdown here...&#10;&#10;Example:&#10;# Heading&#10;## Subheading&#10;&#10;You can use **bold** and *italic* text.&#10;&#10;Math equations:&#10;Inline math: $E = mc^2$&#10;Block math:&#10;$$\frac{d}{dx}e^x = e^x$$"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200">Preview</h2>
            </div>
            <div className="p-6">
              <div 
                id="markdown-content"
                className="w-full h-[600px] p-6 bg-gray-900 rounded-lg border border-gray-700 overflow-auto prose prose-lg max-w-none prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-gray-100 prose-code:text-purple-400 prose-pre:bg-gray-800"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {markdown}
                </ReactMarkdown>
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
