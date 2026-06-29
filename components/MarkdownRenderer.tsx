'use client';

import { useState, ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            return match ? (
              <CodeBlock language={language} value={String(children).replace(/\n$/, '')} />
            ) : (
              <code
                className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/80 font-mono text-xs text-indigo-650 dark:text-indigo-400 font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <table className="min-w-full divide-y divide-slate-250 dark:divide-slate-800 text-left border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-slate-50 dark:bg-slate-900/40">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-slate-100 dark:divide-slate-900/40 bg-white/30 dark:bg-slate-950/20">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-350">{children}</td>;
          },
          a({ href, children, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-650 dark:text-indigo-400 font-semibold hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2.5 space-y-1.5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2.5 space-y-1.5">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-slate-850 dark:text-slate-300">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="pl-4 border-l-4 border-indigo-500/50 dark:border-indigo-500/30 italic text-slate-500 my-4">
                {children}
              </blockquote>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Separated CodeBlock component for local state management
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-mono select-none">
        <span className="font-semibold uppercase text-indigo-500">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-none"
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="text-xs bg-[#1e1e1e] overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '0.8rem',
            lineHeight: '1.4'
          }}
          PreTag="div"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
