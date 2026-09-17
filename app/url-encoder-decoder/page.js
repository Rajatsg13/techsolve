'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import TextToolShell, { ToolButton } from '../components/tool-ui/TextToolShell';
import { ModeTabs } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { encodeUrl, decodeUrl, parseUrlParts } from '../lib/textTools';

const content = getToolContent('url-encoder-decoder');

export default function UrlTool() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('encode');
  const [scope, setScope] = useState('component');
  const [result, setResult] = useState(null);

  const run = () => setResult(mode === 'encode' ? encodeUrl(text, { mode: scope }) : decodeUrl(text, { mode: scope }));
  const parts = result?.ok ? parseUrlParts(result.value) : null;

  return (
    <ToolShell
      slug="url-encoder-decoder"
      title="URL Encoder & Decoder"
      outcome="Percent-encode text for a link, or turn an unreadable encoded URL back into something you can read."
      content={content}
    >
      <TextToolShell
        value={text}
        onChange={t => { setText(t); setResult(null); }}
        placeholder={mode === 'encode' ? 'Text or URL to encode…' : 'Paste an encoded URL, e.g. https%3A%2F%2Fexample.com%2Fa%20b'}
        inputLabel={mode === 'encode' ? 'Text' : 'Encoded URL'}
        outputLabel={mode === 'encode' ? 'Encoded' : 'Decoded'}
        inputRows={8}
        controls={
          <div className="space-y-3">
            <ModeTabs
              label="Direction" value={mode}
              onChange={v => { setMode(v); setResult(null); }}
              options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]}
            />
            <div>
              <p className="text-sm font-semibold text-ink-800 mb-1.5">Scope</p>
              <ModeTabs
                label="Encoding scope" value={scope}
                onChange={v => { setScope(v); setResult(null); }}
                options={[
                  { value: 'component', label: 'Single value' },
                  { value: 'full', label: 'Whole URL' },
                ]}
              />
              <p className="text-xs text-ink-400 mt-1.5">
                {scope === 'component'
                  ? 'Escapes : / ? & = too — use this for one query value.'
                  : 'Leaves : / ? & = intact — use this for a complete address.'}
              </p>
            </div>
          </div>
        }
        actions={
          <>
            <ToolButton onClick={run}>{mode === 'encode' ? 'Encode' : 'Decode'}</ToolButton>
            <ToolButton variant="ghost" onClick={() => { setText(''); setResult(null); }}>Clear</ToolButton>
          </>
        }
        result={result}
        footer={
          parts && (
            <div className="mt-3 border border-ink-100 rounded-2xl bg-white overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-500 px-4 pt-3 pb-2">URL breakdown</p>
              <dl className="divide-y divide-ink-100 text-sm">
                {[['Protocol', parts.protocol], ['Host', parts.host], ['Path', parts.pathname],
                  parts.hash ? ['Fragment', parts.hash] : null].filter(Boolean).map(([k, v]) => (
                  <div key={k} className="flex gap-4 px-4 py-2">
                    <dt className="w-24 shrink-0 text-ink-500">{k}</dt>
                    <dd className="font-mono text-[13px] text-ink-800 break-all">{v}</dd>
                  </div>
                ))}
                {parts.params.map(({ key, value }) => (
                  <div key={key + value} className="flex gap-4 px-4 py-2">
                    <dt className="w-24 shrink-0 text-ink-500 font-mono text-[13px] break-all">{key}</dt>
                    <dd className="font-mono text-[13px] text-ink-800 break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        }
      />
    </ToolShell>
  );
}
