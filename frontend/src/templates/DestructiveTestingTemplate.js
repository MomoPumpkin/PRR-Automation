import React from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';

/**
 * Template for rendering Destructive Testing results using a GitHub-like markdown approach
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - The structured data from the analysis
 * @returns {JSX.Element} The rendered template
 */
const DestructiveTestingTemplate = ({ data }) => {
  if (!data) {
    return <div className="text-gray-500 italic">No analysis data available</div>;
  }

  // Format the raw text to ensure proper markdown rendering
  const formatRawText = (text) => {
    if (!text) return '';
    
    // Replace Roman numeral sections with markdown headings
    let formattedText = text.replace(/^\*\*([IVX]+)\.\s+([^*]+)\*\*/gm, '## $2');
    
    // Replace numbered sections with markdown headings
    formattedText = formattedText.replace(/^(\d+)\.\s+([A-Z][^:]+):/gm, '### $2');
    
    // Ensure tables have proper spacing
    formattedText = formattedText.replace(/\|\s*\n/g, '|\n');
    
    // Ensure bullet points are properly formatted
    formattedText = formattedText.replace(/^\*\s+/gm, '* ');
    
    // Add a title if not present
    if (!formattedText.startsWith('# ')) {
      formattedText = '# Destructive Testing Plan\n\n' + formattedText;
    }
    
    return formattedText;
  };

  return (
    <div className="destructive-testing-template">
      <MarkdownRenderer content={formatRawText(data.raw_text)} />
    </div>
  );
};

export default DestructiveTestingTemplate;