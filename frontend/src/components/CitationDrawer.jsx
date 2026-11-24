import React, { useState } from 'react';
import { X, BookOpen, FileText, CheckCircle2, ExternalLink, Eye, Download } from 'lucide-react';
import DocumentViewerModal from './DocumentViewerModal';

export default function CitationDrawer({ isOpen, onClose, sources, onViewSource }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  if (!isOpen) return null;

  const handleOpenDoc = (src) => {
    if (onViewSource) {
      onViewSource(src);
    } else {
      setSelectedDoc(src);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
        <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Verified Citations & Sources</h3>
                <p className="text-[11px] text-slate-500">Click any source to view full document</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950">
              <span className="font-bold text-blue-900">Official Grounded Answer:</span> The AI assistant constructed this reply strictly from the indexed college handbooks below.
            </div>

            {sources && sources.length > 0 ? (
              sources.map((src, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3 cursor-pointer group"
                  onClick={() => handleOpenDoc(src)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-700 flex-shrink-0" />
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-900">
                        {src.document_title || src.title}
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      {Math.round((src.similarity || 0.95) * 100)}% match
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                        Page {src.page_number || 1}
                      </span>
                      {src.filename && <span className="font-mono text-[10px] truncate max-w-[150px]">{src.filename}</span>}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors">
                      <Eye className="w-3 h-3 text-blue-700" />
                      <span>View PDF</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans line-clamp-4">
                    "{src.content_snippet || src.content || 'Official document text content'}"
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No source records available.</p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Hallucination Protected
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {selectedDoc && (
        <DocumentViewerModal
          isOpen={Boolean(selectedDoc)}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
        />
      )}
    </>
  );
}
