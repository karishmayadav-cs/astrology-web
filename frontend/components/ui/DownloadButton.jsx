import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { generatePDFReport } from '../../utils/pdfGenerator';

export default function DownloadButton({ userData, readingData, type = 'Palm' }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      // Calls the pdfGenerator utility
      await generatePDFReport(userData, readingData, type);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="btn-cosmic"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px 28px',
        background: isGenerating 
          ? 'rgba(255,255,255,0.05)'
          : 'linear-gradient(135deg, #d4af37 0%, #aa8410 100%)',
        border: isGenerating
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid #ffd700',
        borderRadius: '12px',
        color: isGenerating ? 'rgba(255,255,255,0.5)' : '#000000',
        fontSize: '0.88rem',
        fontWeight: 'bold',
        fontFamily: "'Cinzel', serif",
        letterSpacing: '0.08em',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        boxShadow: isGenerating ? 'none' : '0 4px 15px rgba(212, 175, 55, 0.3)',
        transition: 'all 0.3s ease',
        outline: 'none',
        margin: '20px auto'
      }}
      onMouseEnter={(e) => {
        if (!isGenerating) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.45), 0 0 10px rgba(255, 215, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isGenerating) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
        }
      }}
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download size={16} />
          <span>Download Full Report</span>
        </>
      )}

      {/* Inline rotate keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </button>
  );
}
