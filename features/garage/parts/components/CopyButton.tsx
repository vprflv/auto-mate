'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

type Props = {
    value: string;
    label?: string;
};

export default function CopyButton({ value, label }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = value;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            title={label ? `Скопировать ${label}` : 'Скопировать'}
            className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-blue-400 transition"
        >
            <span className="font-mono text-xs">{value}</span>
            {copied ? (
                <Check size={14} className="text-green-400 shrink-0" />
            ) : (
                <Copy size={14} className="shrink-0" />
            )}
        </button>
    );
}