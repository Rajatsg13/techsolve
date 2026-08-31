'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import TextToolShell, { ToolButton } from '../components/tool-ui/TextToolShell';
import { ModeTabs } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { formatJson, minifyJson, validateJson } from '../lib/textTools';
import { downloadText } from '../lib/download';

const content = getToolContent('json-formatter');
const SAMPLE = '{"order":{"id":"SO-1042","customer":"Meera Rao","items":[{"sku":"A-19","qty":2,"price":450},{"sku":"B-07","qty":1,"price":1299}],"paid":true,"notes":null}}';

export default function JsonFormatter() {
  const [text, setText] = useState('');
  const [indent, setIndent] = useState('2');
  const [result, setResult] = useState(null);

  const run = (fn) => setResult(fn());
  const indentValue = indent === 'tab' ? '\t' : Number(indent);

  return (
    <ToolShell
      slug="json-formatter"
      title="JSON Formatter & Validator"
      outcome="Format, minify or check JSON, and get told exactly which line is broken when it is."
      content={content}
    >
      <TextToolShell
        value={text}
        onChange={t => { setText(t); setResult(null); }}
        placeholder='Paste JSON here, e.g. {"name":"Priya","roles":["admin","editor"]}'
        inputLabel="JSON input"
        outputLabel="Result"
        controls={
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">Indent</p>
              <ModeTabs
                label="Indent size"
                value={indent}
                onChange={v => { setIndent(v); setResult(null); }}
                options={[
                  { value: '2', label: '2 spaces' },
                  { value: '4', label: '4 spaces' },
                  { value: 'tab', label: 'Tab' },
                ]}
              />
            </div>
            <button
              type="button"
              onClick={() => { setText(SAMPLE); setResult(null); }}
              className="text-xs font-semibold text-brand-700 hover:text-brand-900 pb-3"
            >
              Load a sample
            </button>
          </div>
        }
        actions={
          <>
            <ToolButton onClick={() => run(() => formatJson(text, indentValue))}>Format</ToolButton>
            <ToolButton variant="ghost" onClick={() => run(() => minifyJson(text))}>Minify</ToolButton>
            <ToolButton variant="ghost" onClick={() => run(() => validateJson(text))}>Validate only</ToolButton>
            <ToolButton variant="ghost" onClick={() => { setText(''); setResult(null); }}>Clear</ToolButton>
          </>
        }
        result={result}
        footer={
          result?.ok && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-data bg-data-soft rounded-lg px-2.5 py-1">
                Valid JSON
              </span>
              {result.type && (
                <span className="text-xs text-ink-500">
                  Top level: {result.type}
                  {result.topLevelKeys !== null && result.topLevelKeys !== undefined && ` · ${result.topLevelKeys} keys`}
                  {result.arrayLength !== null && result.arrayLength !== undefined && ` · ${result.arrayLength} items`}
                  {result.depth ? ` · ${result.depth} levels deep` : ''}
                </span>
              )}
              <button
                type="button"
                onClick={() => downloadText(result.value, 'formatted.json', 'application/json')}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900"
              >
                Download .json
              </button>
            </div>
          )
        }
      />
    </ToolShell>
  );
}
