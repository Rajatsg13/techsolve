'use client';
import { useState } from 'react';
import ToolShell from '../components/tool-ui/ToolShell';
import TextToolShell, { ToolButton } from '../components/tool-ui/TextToolShell';
import { ModeTabs, CheckField } from '../components/tool-ui/Field';
import { getToolContent } from '../content/tools';
import { encodeBase64, decodeBase64 } from '../lib/textTools';

const content = getToolContent('base64-encoder-decoder');

export default function Base64Tool() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const [result, setResult] = useState(null);

  const run = () => setResult(mode === 'encode' ? encodeBase64(text, { urlSafe }) : decodeBase64(text));
  const reset = (next) => { setMode(next); setResult(null); };

  const swap = () => {
    if (!result?.ok) return;
    setText(result.value);
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setResult(null);
  };

  return (
    <ToolShell
      slug="base64-encoder-decoder"
      title="Base64 Encoder & Decoder"
      outcome="Convert text to Base64 and back, including accented and non-Latin characters."
      content={content}
    >
      <TextToolShell
        value={text}
        onChange={t => { setText(t); setResult(null); }}
        placeholder={mode === 'encode' ? 'Type or paste the text to encode…' : 'Paste Base64 to decode…'}
        inputLabel={mode === 'encode' ? 'Text' : 'Base64'}
        outputLabel={mode === 'encode' ? 'Base64' : 'Decoded text'}
        monoInput={mode === 'decode'}
        inputRows={9}
        controls={
          <div className="space-y-3">
            <ModeTabs
              label="Direction"
              value={mode}
              onChange={reset}
              options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]}
            />
            {mode === 'encode' && (
              <CheckField
                id="b64-urlsafe"
                label="URL-safe output"
                checked={urlSafe}
                onChange={v => { setUrlSafe(v); setResult(null); }}
                hint="Uses - and _ instead of + and /, and drops the = padding. Safe to put in a URL or filename."
              />
            )}
          </div>
        }
        actions={
          <>
            <ToolButton onClick={run}>{mode === 'encode' ? 'Encode' : 'Decode'}</ToolButton>
            <ToolButton variant="ghost" onClick={swap} disabled={!result?.ok}>Use result as input</ToolButton>
            <ToolButton variant="ghost" onClick={() => { setText(''); setResult(null); }}>Clear</ToolButton>
          </>
        }
        result={result}
        footer={
          result?.ok && result.byteLength != null && (
            <p className="mt-2 text-xs text-ink-500">Decoded {result.byteLength.toLocaleString()} bytes of UTF-8 text.</p>
          )
        }
      />
    </ToolShell>
  );
}
