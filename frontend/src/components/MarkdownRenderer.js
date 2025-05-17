import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

/**
 * A component for rendering markdown content with GitHub Flavored Markdown support
 * and safe HTML rendering.
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - The markdown content to render
 * @param {Object} props.className - Optional CSS class name for the container
 * @returns {JSX.Element} The rendered markdown
 */
const MarkdownRenderer = ({ content, className }) => {
  if (!content) {
    return <div className="text-gray-500 italic">No content available</div>;
  }

  return (
    <div className={`markdown-content ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Customize headings
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-4 text-primary-700" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 text-primary-600" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2 text-primary-500" {...props} />,
          
          // Customize lists
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          
          // Customize paragraphs
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          
          // Customize blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
          ),
          
          // Customize code blocks
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <pre className="bg-gray-100 rounded p-4 overflow-x-auto mb-4">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 px-1 rounded" {...props}>
                {children}
              </code>
            );
          },
          
          // Customize tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-gray-50" {...props} />,
          th: ({ node, ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;