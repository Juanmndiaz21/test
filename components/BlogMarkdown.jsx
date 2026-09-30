import React from 'react';

function renderInline(text) {
    if (!text) return '';

    // Split text into chunks handling bold, italic, code, links
    const tokens = [];
    let remaining = text;
    let key = 0;

    while (remaining) {
        // Bold: **text**
        const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
        if (boldMatch) {
            tokens.push(
                <strong key={key++} className="font-bold text-white">
                    {boldMatch[2]}
                </strong>
            );
            remaining = remaining.slice(boldMatch[0].length);
            continue;
        }

        // Inline Code: `code`
        const codeMatch = remaining.match(/^`([^`]+)`/);
        if (codeMatch) {
            tokens.push(
                <code
                    key={key++}
                    className="px-1.5 py-0.5 rounded bg-white/10 text-[#c084fc] font-mono text-[0.9em]"
                >
                    {codeMatch[1]}
                </code>
            );
            remaining = remaining.slice(codeMatch[0].length);
            continue;
        }

        // Links: [text](url)
        const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
            tokens.push(
                <a
                    key={key++}
                    href={linkMatch[2]}
                    target={linkMatch[2].startsWith('http') ? '_blank' : undefined}
                    rel={linkMatch[2].startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-[#9d7cff] hover:underline underline-offset-4 font-semibold"
                >
                    {linkMatch[1]}
                </a>
            );
            remaining = remaining.slice(linkMatch[0].length);
            continue;
        }

        // Normal text up to next special char
        const nextSpecial = remaining.search(/[\*\_`\[]/);
        if (nextSpecial === -1) {
            tokens.push(remaining);
            break;
        } else if (nextSpecial === 0) {
            tokens.push(remaining[0]);
            remaining = remaining.slice(1);
        } else {
            tokens.push(remaining.slice(0, nextSpecial));
            remaining = remaining.slice(nextSpecial);
        }
    }

    return tokens;
}

export default function BlogMarkdown({ content }) {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let key = 0;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
            i++;
            continue;
        }

        // Horizontal rule: --- or ***
        if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
            elements.push(
                <hr key={key++} className="border-white/10 my-8" />
            );
            i++;
            continue;
        }

        // Heading 1: # Title
        if (trimmed.startsWith('# ')) {
            elements.push(
                <h1 key={key++} className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-8 mb-4 tracking-tight">
                    {renderInline(trimmed.replace(/^#\s+/, ''))}
                </h1>
            );
            i++;
            continue;
        }

        // Heading 2: ## Section
        if (trimmed.startsWith('## ')) {
            elements.push(
                <h2 key={key++} className="text-xl sm:text-2xl font-bold text-white mt-8 mb-3 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#9d7cff] rounded-full inline-block" />
                    {renderInline(trimmed.replace(/^##\s+/, ''))}
                </h2>
            );
            i++;
            continue;
        }

        // Heading 3: ### Subsection
        if (trimmed.startsWith('### ')) {
            elements.push(
                <h3 key={key++} className="text-lg sm:text-xl font-bold text-[#c084fc] mt-6 mb-2">
                    {renderInline(trimmed.replace(/^###\s+/, ''))}
                </h3>
            );
            i++;
            continue;
        }

        // Blockquote: > Quote
        if (trimmed.startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
                i++;
            }
            elements.push(
                <blockquote
                    key={key++}
                    className="border-l-4 border-[#9d7cff] bg-[#161126]/80 p-4 sm:p-5 rounded-r-xl my-6 text-slate-300 italic text-base"
                >
                    {quoteLines.map((ql, qIdx) => (
                        <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
                            {renderInline(ql)}
                        </p>
                    ))}
                </blockquote>
            );
            continue;
        }

        // Unordered list: * or -
        if (/^[\*\-]\s+/.test(trimmed)) {
            const listItems = [];
            while (i < lines.length && /^[\*\-]\s+/.test(lines[i].trim())) {
                listItems.push(lines[i].trim().replace(/^[\*\-]\s+/, ''));
                i++;
            }
            elements.push(
                <ul key={key++} className="space-y-2 my-4 list-none pl-1">
                    {listItems.map((item, lIdx) => (
                        <li key={lIdx} className="flex items-start gap-2.5 text-slate-300 text-base leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#9d7cff] shrink-0 mt-2.5" />
                            <span>{renderInline(item)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Markdown Table: | Col 1 | Col 2 |
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
                tableLines.push(lines[i].trim());
                i++;
            }

            if (tableLines.length >= 2) {
                const parseRow = (rowStr) =>
                    rowStr
                        .slice(1, -1)
                        .split('|')
                        .map((c) => c.trim());

                const headers = parseRow(tableLines[0]);
                // Filter out separator rows like |---|---|
                const bodyRows = tableLines.slice(1).filter((r) => !/^[\|\-\s:]+$/.test(r)).map(parseRow);

                elements.push(
                    <div key={key++} className="overflow-x-auto my-6 rounded-xl border border-white/10 panel-surface">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 border-b border-white/10 font-bold text-white font-mono text-xs uppercase tracking-wider">
                                <tr>
                                    {headers.map((h, hIdx) => (
                                        <th key={hIdx} className="py-3 px-4">
                                            {renderInline(h)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-300">
                                {bodyRows.map((cols, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-white/[0.02]">
                                        {cols.map((col, cIdx) => (
                                            <td key={cIdx} className="py-3 px-4">
                                                {renderInline(col)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                continue;
            }
        }

        // Paragraph: collect lines until blank line or special block
        const paragraphLines = [];
        while (
            i < lines.length &&
            lines[i].trim() &&
            !lines[i].trim().startsWith('#') &&
            !lines[i].trim().startsWith('>') &&
            !/^[\*\-]\s+/.test(lines[i].trim()) &&
            !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) &&
            !/^(\-{3,}|\*{3,})$/.test(lines[i].trim())
        ) {
            paragraphLines.push(lines[i].trim());
            i++;
        }

        if (paragraphLines.length > 0) {
            elements.push(
                <p key={key++} className="text-slate-300 text-base sm:text-[17px] leading-relaxed my-4">
                    {paragraphLines.map((pl, pIdx) => (
                        <React.Fragment key={pIdx}>
                            {pIdx > 0 && ' '}
                            {renderInline(pl)}
                        </React.Fragment>
                    ))}
                </p>
            );
        }
    }

    return <div className="blog-prose">{elements}</div>;
}
