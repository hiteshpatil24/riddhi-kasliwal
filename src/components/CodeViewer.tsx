import React, { useState } from 'react';
import { Copy, Check, FileCode, FolderTree, Info, Sparkles } from 'lucide-react';
import { ProjectDefinition } from '../types/project';

interface CodeViewerProps {
  project: ProjectDefinition;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ project }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const currentFile = project.codeFiles[selectedFileIndex] || project.codeFiles[0];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'Presentation':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Business':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Data Access':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Model':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'Testing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Configuration':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'Build':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            Constraint #4, #5, #7, #9
          </span>
          <h2 className="text-lg font-bold text-slate-800">Project Source Code & Package Structure</h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Standard Maven Spring Boot structure with isolated package layers: <code className="text-blue-700 font-semibold">controller</code>, <code className="text-blue-700 font-semibold">service</code>, <code className="text-blue-700 font-semibold">repository</code>, <code className="text-blue-700 font-semibold">model</code>.
        </p>
      </div>

      {/* Main Grid: File Tree + Code Editor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* File Navigator / Package Tree */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4 xl:col-span-3">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <FolderTree className="h-4 w-4 text-blue-600" />
            <span>Package Explorer</span>
          </div>

          <div className="mt-3 space-y-1">
            {project.codeFiles.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 font-semibold ring-1 ring-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="truncate font-mono">{file.filename}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getLayerColor(file.layer)}`}>
                    {file.layer}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Package Structure Guide */}
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300">Maven Directory Hierarchy</div>
            <pre className="mt-1 font-mono text-[10px] text-slate-400 leading-tight">
{`src/
├── main/
│   ├── java/com/example/aarogyacare/
│   │   ├── controller/  (Presentation)
│   │   ├── service/     (Business)
│   │   ├── repository/  (Data Access)
│   │   ├── model/       (Domain Entities)
│   │   └── exception/   (Global Advice)
│   └── resources/
│       └── application.properties
└── test/
    └── java/com/example/aarogyacare/
        └── service/ & controller/`}
            </pre>
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 lg:col-span-8 xl:col-span-9 flex flex-col overflow-hidden">
          {/* File Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {currentFile.path}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${getLayerColor(currentFile.layer)}`}>
                {currentFile.layer} Layer
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* File description */}
          <div className="border-b border-slate-800/60 bg-slate-900/30 px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span>{currentFile.description}</span>
          </div>

          {/* Syntax Highlighted Code Area */}
          <div className="relative flex-1 overflow-x-auto p-4 font-mono text-xs text-slate-200">
            <pre className="leading-relaxed">
              <code>
                {currentFile.content.split('\n').map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell select-none pr-4 text-right text-[11px] text-slate-600">
                      {i + 1}
                    </span>
                    <span className="table-cell whitespace-pre">
                      {highlightJava(line)}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lightweight token highlighter for Java/XML/Properties keywords
function highlightJava(line: string): React.ReactNode {
  // Comments
  if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*') || line.trim().startsWith('#') || line.trim().startsWith('<!--')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // Annotations like @RestController, @Service, @Id, @NotBlank
  const parts = line.split(/(@\w+|"(?:[^"\\]|\\.)*"|\bpackage\b|\bimport\b|\bpublic\b|\bclass\b|\binterface\b|\benum\b|\breturn\b|\bif\b|\belse\b|\bnew\b|\bthrow\b|\bvoid\b|\bprivate\b|\bfinal\b|\bboolean\b|\bint\b|\blong\b|\bDouble\b|\bString\b)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return <span key={index} className="text-emerald-400 font-semibold">{part}</span>;
    }
    if (part.startsWith('"') && part.endsWith('"')) {
      return <span key={index} className="text-amber-300">{part}</span>;
    }
    if (['package', 'import', 'public', 'class', 'interface', 'enum', 'return', 'if', 'else', 'new', 'throw', 'private', 'final'].includes(part)) {
      return <span key={index} className="text-purple-400 font-semibold">{part}</span>;
    }
    if (['void', 'boolean', 'int', 'long', 'Double', 'String', 'Long', 'LocalDate', 'LocalDateTime'].includes(part)) {
      return <span key={index} className="text-cyan-300">{part}</span>;
    }
    return part;
  });
}
