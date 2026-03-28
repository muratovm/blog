/**
 * TELOS Markdown Renderer
 * Zero-dependency markdown parser and card-wrapper for TELOS pages.
 * 
 * Usage:
 *   <script src="../md-renderer.js"></script>
 *   <script>
 *     renderMarkdownPage('../../SOMEFILE.md', {
 *       containerId: 'md-container',
 *       loadingId: 'loading-state',
 *       emptyId: 'empty-state',
 *       errorMessage: 'Could not load file.'
 *     });
 *   </script>
 */

// ── Inline formatting ──────────────────────────────────────────────

function _mdEscapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function _mdInlineFormat(text) {
    // Bold + italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Inline code
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');
    // Links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return text;
}

// ── Block-level parser ─────────────────────────────────────────────

function parseMarkdown(md) {
    const lines = md.split('\n');
    let html = '';
    let inList = false;
    let inChecklist = false;
    let inCodeBlock = false;
    let codeContent = '';
    let inTable = false;
    let tableRows = [];

    function closeList() {
        if (inList) { html += '</ul>'; inList = false; inChecklist = false; }
    }

    function closeTable() {
        if (inTable && tableRows.length > 0) {
            html += '<div class="md-table-wrap"><table>';
            tableRows.forEach((row, idx) => {
                const tag = idx === 0 ? 'th' : 'td';
                const cells = row.split('|').filter(c => c.trim() !== '');
                if (idx === 1 && cells.every(c => /^[\s:-]+$/.test(c))) return; // skip separator
                html += '<tr>';
                cells.forEach(c => { html += `<${tag}>${_mdInlineFormat(c.trim())}</${tag}>`; });
                html += '</tr>';
            });
            html += '</table></div>';
            tableRows = [];
            inTable = false;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Fenced code blocks
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                html += `<pre><code>${_mdEscapeHtml(codeContent.trim())}</code></pre>`;
                codeContent = '';
                inCodeBlock = false;
            } else {
                closeList();
                closeTable();
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            codeContent += line + '\n';
            continue;
        }

        // Table rows (lines with |)
        if (/^\s*\|/.test(line)) {
            closeList();
            inTable = true;
            tableRows.push(line);
            continue;
        } else {
            closeTable();
        }

        // Horizontal rules
        if (/^---+\s*$/.test(line.trim())) {
            closeList();
            html += '<hr>';
            continue;
        }

        // Empty lines
        if (line.trim() === '') {
            closeList();
            continue;
        }

        // Headers
        const headerMatch = line.match(/^(#{1,4})\s+(.+)/);
        if (headerMatch) {
            closeList();
            const level = headerMatch[1].length;
            html += `<h${level}>${_mdInlineFormat(headerMatch[2])}</h${level}>`;
            continue;
        }

        // Checkbox list items
        const checkMatch = line.match(/^\s*[-*]\s+\[([ xX/])\]\s*(.*)/);
        if (checkMatch) {
            if (!inChecklist) {
                if (inList) html += '</ul>';
                html += '<ul class="checklist">';
                inChecklist = true;
                inList = true;
            }
            const checked = checkMatch[1] !== ' ';
            html += `<li class="${checked ? 'checked' : 'unchecked'}">${_mdInlineFormat(checkMatch[2])}</li>`;
            continue;
        }

        // Regular list items
        const listMatch = line.match(/^\s*[-*]\s+(.*)/);
        if (listMatch) {
            if (inChecklist) { html += '</ul>'; inChecklist = false; inList = false; }
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${_mdInlineFormat(listMatch[1])}</li>`;
            continue;
        }

        // Regular paragraphs
        closeList();
        html += `<p>${_mdInlineFormat(line)}</p>`;
    }

    closeList();
    closeTable();
    return html;
}

// ── Card wrapper ───────────────────────────────────────────────────

function wrapInCards(html) {
    const sections = html.split('<hr>');
    if (sections.length <= 1) return html;

    // First section (before first <hr>) — render as-is (title area)
    let result = sections[0];

    // Remaining sections — extract leading h2 as section label, wrap rest in card
    for (let i = 1; i < sections.length; i++) {
        const section = sections[i].trim();
        if (section) {
            const h2Match = section.match(/^(<h2>.*?<\/h2>)([\s\S]*)/);
            if (h2Match) {
                result += h2Match[1] + `<div class="md-section-card">${h2Match[2].trim()}</div>`;
            } else {
                result += `<div class="md-section-card">${section}</div>`;
            }
        }
    }

    return result;
}

// ── Page loader ────────────────────────────────────────────────────

async function renderMarkdownPage(mdPath, opts = {}) {
    const containerId = opts.containerId || 'md-container';
    const loadingId = opts.loadingId || 'loading-state';
    const emptyId = opts.emptyId || 'empty-state';

    const container = document.getElementById(containerId);
    const loadingEl = document.getElementById(loadingId);
    const emptyEl = document.getElementById(emptyId);

    try {
        const response = await fetch(mdPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const markdown = await response.text();
        const rawHtml = parseMarkdown(markdown);
        const cardHtml = wrapInCards(rawHtml);

        container.innerHTML = cardHtml;
        if (loadingEl) loadingEl.style.display = 'none';
        container.style.display = 'block';
    } catch (err) {
        console.error(`Failed to load ${mdPath}:`, err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
    }
}
