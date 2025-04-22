"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  FileText,
  Download,
  Tag,
  Copy,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { MeetingSummary } from "@/types/summary";

interface SummaryModalProps {
  summary: MeetingSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SummaryModal({
  summary,
  isOpen,
  onClose,
}: SummaryModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"format" | "raw">("format");

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Function to download summary as text file
  const downloadSummary = () => {
    if (!summary) return;

    // Create a text version of the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = summary.content;
    const textContent =
      tempDiv.textContent || tempDiv.innerText || summary.content;

    const filename = summary.title
      ? summary.title.replace(/\s+/g, "_")
      : summary.filename.replace(/\s+/g, "_");

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to copy summary content to clipboard
  const copySummary = () => {
    if (!summary) return;

    // Create a text version of the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = summary.content;
    const textContent =
      tempDiv.textContent || tempDiv.innerText || summary.content;

    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
    });
  };

  // Function to print the summary
  const printSummary = () => {
    if (!summary) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = summary.title || summary.filename;
    const date = formatDate(summary.created_at);

    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - Meeting Summary</title>
          <style>
            @media print {
              @page {
                margin: 1.5cm;
              }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 1.5rem;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 1rem;
              margin-bottom: 1.5rem;
            }
            .title {
              font-size: 1.8rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
              color: #4f46e5;
            }
            .meta {
              color: #666;
              font-size: 0.9rem;
            }
            .content {
              margin-top: 1.5rem;
            }
            h1 { 
              font-size: 1.7rem; 
              margin-top: 1.5rem; 
              margin-bottom: 0.75rem; 
              color: #4f46e5;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              text-transform: uppercase;
            }
            h2 { 
              font-size: 1.4rem; 
              margin-top: 1.3rem; 
              margin-bottom: 0.65rem; 
              color: #4f46e5;
            }
            h3 { 
              font-size: 1.2rem; 
              margin-top: 1.1rem; 
              margin-bottom: 0.55rem; 
              color: #4f46e5;
              border-left: 3px solid #4f46e5;
              padding-left: 10px;
            }
            p { margin-bottom: 0.8rem; }
            ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
            li { margin-bottom: 0.3rem; position: relative; }
            ul li::before {
              content: "•"; 
              color: #4f46e5;
              display: inline-block;
              width: 1em;
              margin-left: -1em;
              font-weight: bold;
            }
            hr { 
              border: 0; 
              border-top: 1px solid #e5e7eb; 
              margin: 1.5rem 0; 
            }
            .section-divider {
              border-top: 1px solid #4f46e5;
              border-bottom: none;
              margin: 1.5rem 0;
              opacity: 0.5;
            }
            blockquote {
              border-left: 4px solid #4f46e5;
              padding-left: 1rem;
              margin-left: 0;
              color: #666;
              font-style: italic;
              background-color: #f9f9ff;
              padding: 0.75rem 1rem;
              border-radius: 0 0.25rem 0.25rem 0;
            }
            strong { 
              font-weight: bold; 
              color: #4f46e5;
            }
            em { font-style: italic; }
            pre {
              background-color: #f5f5f5;
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              background-color: #f5f5f5;
              padding: 0.2rem 0.4rem;
              border-radius: 3px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1rem;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 0.5rem;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .metadata-item {
              display: inline-block;
              margin-right: 1rem;
              margin-bottom: 0.5rem;
              color: #666;
            }
            .metadata-item strong {
              color: #4f46e5;
              margin-right: 0.3rem;
            }
            .footer {
              margin-top: 2rem;
              border-top: 1px solid #ddd;
              padding-top: 1rem;
              text-align: center;
              font-size: 0.8rem;
              color: #666;
            }
            @media print {
              body { font-size: 11pt; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            <div class="meta">Meeting Summary | ${date}</div>
          </div>
          <div class="content" id="summaryContent">
          </div>
          <div class="footer">
            Generated from Loomify
          </div>
          <script>
            window.onload = function() {
              // Render the summary content in React-like way
              const summaryContent = document.getElementById('summaryContent');
              const rawContent = ${JSON.stringify(summary.content)};
              
              // Simple HTML sanitizer to keep basic formatting but remove scripts
              function sanitizeHTML(html) {
                const temp = document.createElement('div');
                temp.innerHTML = html;
                // Remove script tags and event attributes
                const scripts = temp.getElementsByTagName('script');
                for (let i = scripts.length - 1; i >= 0; i--) {
                  scripts[i].parentNode.removeChild(scripts[i]);
                }
                
                // Format headers properly
                const headers = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
                headers.forEach(header => {
                  if (header.tagName === 'H1') {
                    header.style.fontSize = '1.7rem';
                    header.style.fontWeight = 'bold';
                    header.style.color = '#4f46e5';
                    header.style.borderBottom = '1px solid #e5e7eb';
                    header.style.paddingBottom = '5px';
                    header.style.textTransform = 'uppercase';
                  } else if (header.tagName === 'H2') {
                    header.style.fontSize = '1.4rem';
                    header.style.fontWeight = 'bold';
                    header.style.color = '#4f46e5';
                  } else if (header.tagName === 'H3') {
                    header.style.fontSize = '1.2rem';
                    header.style.fontWeight = 'bold';
                    header.style.color = '#4f46e5';
                    header.style.borderLeft = '3px solid #4f46e5';
                    header.style.paddingLeft = '10px';
                  }
                });
                
                // Format lists
                const lists = temp.querySelectorAll('ul, ol');
                lists.forEach(list => {
                  list.style.marginBottom = '1rem';
                  list.style.paddingLeft = '2rem';
                });
                
                const listItems = temp.querySelectorAll('li');
                listItems.forEach(item => {
                  item.style.marginBottom = '0.3rem';
                });
                
                // Format strong text
                const strongs = temp.querySelectorAll('strong');
                strongs.forEach(strong => {
                  strong.style.fontWeight = 'bold';
                  strong.style.color = '#4f46e5';
                });
                
                return temp.innerHTML;
              }
              
              summaryContent.innerHTML = sanitizeHTML(rawContent);
              
              // Enhance appearance further
              const allParagraphs = document.querySelectorAll('p');
              allParagraphs.forEach(p => {
                p.style.marginBottom = '0.8rem';
                p.style.lineHeight = '1.6';
              });
              
              // Add horizontal rules for section separation
              const headers = document.querySelectorAll('h1, h2');
              headers.forEach(header => {
                const hr = document.createElement('hr');
                hr.className = 'section-divider';
                header.parentNode.insertBefore(hr, header);
              });
              
              // Remove duplicate dividers
              const dividers = document.querySelectorAll('hr + hr');
              dividers.forEach(div => {
                div.parentNode.removeChild(div);
              });
              
              window.print();
              // Close after printing
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Function to render meeting summary with proper formatting
  const renderFormattedContent = () => {
    if (!summary) return null;

    // Extract paragraphs to process
    const content = summary.content;

    // Convert HTML to text content for custom rendering
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const textContent = tempDiv.innerText || content;

    // Split by lines for processing
    let lines = textContent
      .split("\n")
      .filter((line) => line.trim().length > 0);

    // Pre-process the lines to filter out standalone emoji lines
    // that are immediately followed by the same emoji with content
    const processedLines: string[] = [];
    const emojiPattern = /^(📅|👤|🔍|👥|✅|📌|📋|💡|⏭️|📝)$/;

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      // Check if this is a standalone emoji
      if (emojiPattern.test(currentLine)) {
        // Check the next line to see if it starts with the same emoji
        if (i + 1 < lines.length && lines[i + 1].includes(currentLine)) {
          // Skip this emoji-only line
          continue;
        }
      }
      processedLines.push(lines[i]);
    }

    // Use the processed lines for rendering
    lines = processedLines;

    // Keep track of current section to apply appropriate styling
    let currentSection = "";

    // Clean up line content - helper function
    const cleanLine = (line: string) => {
      // Remove markdown asterisks for bold text
      return line.replace(/\*\*/g, "");
    };

    return (
      <div className="prose prose-slate dark:prose-invert max-w-none meeting-summary">
        {lines.map((line, index) => {
          // Handle end of summary statement
          if (
            line.includes("End of summary") ||
            line.includes("Generated by the Summary & Report Manager Agent")
          ) {
            return (
              <div
                key={`end-${index}`}
                className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 text-center"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 italic font-light">
                  {cleanLine(line.replace(/^###_/, ""))}
                </p>
              </div>
            );
          }

          // Handle meeting title with # markdown (with 📝)
          if (
            (line.startsWith("# ") || line.startsWith("#")) &&
            line.includes("📝")
          ) {
            return (
              <h1
                key={`title-${index}`}
                className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 mb-6 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2"
              >
                {cleanLine(line.replace(/^#\s*/, ""))}
              </h1>
            );
          }

          // Handle title with just 📝 emoji (without # markdown)
          if (line.includes("📝") && !line.startsWith("#")) {
            return (
              <h1
                key={`title-${index}`}
                className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 mb-6 first:mt-0 border-b border-slate-200 dark:border-slate-700 pb-2"
              >
                {cleanLine(line)}
              </h1>
            );
          }

          // Handle date with 📅 emoji
          if (line.includes("📅")) {
            const dateContent = cleanLine(line.replace(/^📅\s*/, "").trim());
            return (
              <div
                key={`date-${index}`}
                className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex items-center"
              >
                <span className="mr-2 text-indigo-500 dark:text-indigo-400"></span>
                <span>{dateContent}</span>
              </div>
            );
          }

          // Handle prepared by with 👤 emoji
          if (line.includes("👤")) {
            const authorContent = cleanLine(line.replace(/^👤\s*/, "").trim());
            return (
              <div
                key={`author-${index}`}
                className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex items-center"
              >
                <span className="mr-2 text-indigo-500 dark:text-indigo-400"></span>
                <span>{authorContent}</span>
              </div>
            );
          }

          // Check for section headers with ## markdown and emojis
          if (line.startsWith("## ") || line.startsWith("##")) {
            const sectionTitle = cleanLine(line.replace(/^##\s*/, ""));

            // Determine section type based on emoji
            if (sectionTitle.includes("🔍")) {
              currentSection = "summary";
              return (
                <div key={`section-${index}`} className="mt-8 mb-4">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 pl-4 py-3 border-l-4 border-l-purple-500 dark:border-l-purple-400 rounded-r-md bg-purple-50 dark:bg-purple-900/10">
                    {sectionTitle}
                  </h2>
                </div>
              );
            } else if (sectionTitle.includes("👥")) {
              currentSection = "participants";
              return (
                <div key={`section-${index}`} className="mt-8 mb-4">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 pl-4 py-3 border-l-4 border-l-indigo-500 dark:border-l-indigo-400 rounded-r-md bg-indigo-50 dark:bg-indigo-900/10">
                    {sectionTitle}
                  </h2>
                </div>
              );
            } else if (sectionTitle.includes("✅")) {
              currentSection = "decisions";
              return (
                <div key={`section-${index}`} className="mt-8 mb-4">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 pl-4 py-3 border-l-4 border-l-blue-500 dark:border-l-blue-400 rounded-r-md bg-blue-50 dark:bg-blue-900/10">
                    {sectionTitle}
                  </h2>
                </div>
              );
            } else if (
              sectionTitle.includes("📌") ||
              sectionTitle.includes("📋")
            ) {
              currentSection = "actions";
              return (
                <div key={`section-${index}`} className="mt-8 mb-4">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 pl-4 py-3 border-l-4 border-l-amber-500 dark:border-l-amber-400 rounded-r-md bg-amber-50 dark:bg-amber-900/10">
                    {sectionTitle}
                  </h2>
                </div>
              );
            } else if (sectionTitle.includes("💡")) {
              currentSection = "insights";
              return (
                <div key={`section-${index}`} className="mt-8 mb-4">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 pl-4 py-3 border-l-4 border-l-yellow-500 dark:border-l-yellow-400 rounded-r-md bg-yellow-50 dark:bg-yellow-900/10">
                    {sectionTitle}
                  </h2>
                </div>
              );
            } else if (sectionTitle.includes("⏭️")) {
              currentSection = "followups";
              return (
                <div key={`section-${index}`} className="mt-8 mb-4">
                  <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 pl-4 py-3 border-l-4 border-l-emerald-500 dark:border-l-emerald-400 rounded-r-md bg-emerald-50 dark:bg-emerald-900/10">
                    {sectionTitle}
                  </h2>
                </div>
              );
            } else {
              // Generic section
              return (
                <h2
                  key={`h2-${index}`}
                  className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-6 mb-3"
                >
                  {sectionTitle}
                </h2>
              );
            }
          }

          // Handle subsection headers with ### markdown
          if (line.startsWith("### ") || line.startsWith("###")) {
            return (
              <h3
                key={`h3-${index}`}
                className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-5 mb-2 border-l-4 border-indigo-500 pl-3"
              >
                {cleanLine(line.replace(/^###\s*/, ""))}
              </h3>
            );
          }

          // Handle participant entries (single participant)
          if (
            currentSection === "participants" &&
            (line.startsWith("👤") || line.trim().length > 0)
          ) {
            // Clean participant name
            const participantName = cleanLine(
              line.replace(/^👤\s*/, "").trim()
            );
            if (participantName.length > 0) {
              return (
                <div
                  key={`participant-${index}`}
                  className="flex items-center gap-2 mb-2"
                >
                  <span className="text-indigo-500 dark:text-indigo-400">
                    👤
                  </span>
                  <p className="m-0">{participantName}</p>
                </div>
              );
            }
          }

          // Handle decision items with checkmarks
          if (
            currentSection === "decisions" &&
            (line.startsWith("✓") || line.includes("✓"))
          ) {
            const decisionContent = cleanLine(line.replace(/^✓\s*/, "").trim());
            return (
              <div
                key={`decision-${index}`}
                className="flex items-start gap-2 mb-2"
              >
                <span className="text-blue-500 dark:text-blue-400 font-bold mt-0.5 min-w-[18px] text-center">
                  ✓
                </span>
                <p className="m-0 flex-1">{decisionContent}</p>
              </div>
            );
          }

          // Handle task items with or without brackets
          if (
            currentSection === "actions" &&
            (line.includes("Task") ||
              line.startsWith("☑️") ||
              line.includes("☑️"))
          ) {
            // Extract task content after cleaning
            const taskContent = cleanLine(line.replace(/^☑️\s*/, "").trim());

            // Try to match task number and description - multiple possible formats
            const taskMatch = taskContent.match(
              /^(?:\[)?Task\s*(\d+)(?:\])?(?:\s*[-–]\s*|\s+)(.*)/i
            );

            // If we can identify the task format
            if (taskMatch) {
              const taskNum = taskMatch[1];
              let taskDesc = taskMatch[2];

              // Handle case where description includes due/assigned info
              const assignedPattern =
                /(.+?)(?:\s*[-–]\s*Assigned to:\s*([^(]+))?(?:\s*\(?Due:\s*([^)]+)\)?)?$/i;
              const infoMatch = taskDesc.match(assignedPattern);

              let assignedTo = "";
              let dueDate = "";

              if (infoMatch) {
                taskDesc = infoMatch[1].trim();
                if (infoMatch[2]) assignedTo = infoMatch[2].trim();
                if (infoMatch[3]) dueDate = infoMatch[3].trim();
              }

              // Look ahead for assignment and due date lines if not found in the current line
              if (
                !assignedTo &&
                index + 1 < lines.length &&
                lines[index + 1].includes("Assigned to:")
              ) {
                assignedTo = cleanLine(
                  lines[index + 1].replace(/^Assigned to:\s*/, "").trim()
                );
              }

              if (
                !dueDate &&
                index + 2 < lines.length &&
                lines[index + 2].includes("Due:")
              ) {
                dueDate = cleanLine(
                  lines[index + 2].replace(/^Due:\s*/, "").trim()
                );
              }

              // Check if this line contains pieces of another task (could happen with improper formatting)
              if (taskDesc.includes("Task") && taskDesc.match(/Task\s+\d+/)) {
                // Only use the part before the next task reference
                const splitDesc = taskDesc.split(/Task\s+\d+/)[0].trim();
                taskDesc = splitDesc.replace(/\s*[-–]\s*$/, ""); // Remove trailing dash
              }

              return (
                <div
                  key={`task-${index}`}
                  className="flex items-start gap-3 mb-3 border-l-4 border-amber-400 pl-3"
                >
                  <span className="text-amber-500 dark:text-amber-400 font-bold mt-0.5">
                    ☑️
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-amber-800 dark:text-amber-300">
                      Task {taskNum}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mt-1">
                      {taskDesc}
                    </div>
                    {assignedTo && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        <span className="font-medium">Assigned to:</span>{" "}
                        {assignedTo}
                      </div>
                    )}
                    {dueDate && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Due:</span> {dueDate}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // For simpler task formats or fallback
            return (
              <div
                key={`task-${index}`}
                className="flex items-start gap-3 mb-3 border-l-4 border-amber-400 pl-3"
              >
                <span className="text-amber-500 dark:text-amber-400 font-bold mt-0.5">
                  ☑️
                </span>
                <div className="flex-1">
                  <div className="text-slate-700 dark:text-slate-300">
                    {taskContent.replace(/^\[|\]$/g, "")}{" "}
                    {/* Remove any brackets */}
                  </div>
                </div>
              </div>
            );
          }

          // Handle insights with lightbulb emoji or dash (-) in insights section
          if (
            currentSection === "insights" &&
            (line.startsWith("-") || line.includes("-"))
          ) {
            const insightContent = cleanLine(line.replace(/^-\s*/, "").trim());
            return (
              <div
                key={`insight-${index}`}
                className="flex items-start gap-2 mb-2"
              >
                <span className="text-yellow-500 dark:text-yellow-400 font-bold mt-0.5 min-w-[18px] text-center">
                  💡
                </span>
                <p className="m-0 flex-1">{insightContent}</p>
              </div>
            );
          }

          // Handle follow-ups with dash (-) in followups section
          if (
            currentSection === "followups" &&
            (line.startsWith("-") || line.includes("-"))
          ) {
            const followupContent = cleanLine(line.replace(/^-\s*/, "").trim());
            return (
              <div
                key={`followup-${index}`}
                className="flex items-start gap-2 mb-2"
              >
                <span className="text-emerald-500 dark:text-emerald-400 font-bold mt-0.5 min-w-[18px] text-center">
                  →
                </span>
                <p className="m-0 flex-1">{followupContent}</p>
              </div>
            );
          }

          // Handle generic dashes or bullet points in other sections
          if (line.startsWith("-") || line.startsWith("•")) {
            const bulletContent = cleanLine(
              line.replace(/^[-•]\s*/, "").trim()
            );
            // Apply styling based on current section
            let bulletClass = "text-indigo-500 dark:text-indigo-400";
            let bulletSymbol = "•";

            if (currentSection === "decisions") {
              bulletClass = "text-blue-500 dark:text-blue-400";
              bulletSymbol = "✓";
            }

            return (
              <div
                key={`bullet-${index}`}
                className="flex items-start gap-2 mb-2"
              >
                <span
                  className={`${bulletClass} font-bold mt-0.5 min-w-[18px] text-center`}
                >
                  {bulletSymbol}
                </span>
                <p className="m-0 flex-1">{bulletContent}</p>
              </div>
            );
          }

          // Regular paragraph, cleaned of any markdown
          return (
            <p key={`p-${index}`} className="mb-4">
              {cleanLine(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-start space-x-3 min-w-0">
                {summary.title ? (
                  <>
                    <Tag
                      className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0"
                      size={20}
                    />
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
                        {summary.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5 truncate">
                        {summary.filename}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText
                      className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0"
                      size={20}
                    />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
                      {summary.filename}
                    </h3>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    printSummary();
                  }}
                  className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 group relative hidden sm:block"
                  title="Print summary"
                >
                  <Printer size={18} />
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Print
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copySummary();
                  }}
                  className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 group relative"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <Copy size={18} />
                  )}
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {copied ? "Copied!" : "Copy"}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSummary();
                  }}
                  className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 group relative"
                  title="Download summary"
                >
                  <Download size={18} />
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Download
                  </span>
                </button>
                <button
                  onClick={onClose}
                  className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 group relative"
                >
                  <X size={18} />
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Close
                  </span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center text-slate-600 dark:text-gray-400">
                  <Calendar size={16} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">{formatDate(summary.created_at)}</p>
                </div>

                <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveTab("format")}
                    className={`px-3 py-1.5 text-xs ${
                      activeTab === "format"
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setActiveTab("raw")}
                    className={`px-3 py-1.5 text-xs ${
                      activeTab === "raw"
                        ? "bg-indigo-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    Raw HTML
                  </button>
                </div>
              </div>

              {activeTab === "format" ? (
                <div className="overflow-y-auto custom-scrollbar max-h-[65vh] bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50 pdf-like">
                  <div className="p-6 sm:p-8 meeting-summary-content">
                    {renderFormattedContent()}
                  </div>
                </div>
              ) : (
                <div className="overflow-y-auto custom-scrollbar max-h-[65vh] bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50 p-4">
                  <pre className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                    {summary.content}
                  </pre>
                </div>
              )}
            </div>

            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }

              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
              }
              .dark .custom-scrollbar::-webkit-scrollbar-track {
                background: #1e293b;
              }

              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
              }
              .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #475569;
              }

              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
              .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #64748b;
              }

              .pdf-like {
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
                  0 1px 2px 0 rgba(0, 0, 0, 0.06);
                background-color: white;
              }
              .dark .pdf-like {
                background-color: #0f172a;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3),
                  0 1px 2px 0 rgba(0, 0, 0, 0.2);
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
