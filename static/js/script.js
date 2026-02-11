function onScreenResize() {
    const myDiv = document.querySelector('details');
    if (!myDiv) return;

    if (window.innerWidth > 1200) {
        myDiv.open = true;
    } else {
        myDiv.open = false;
    }
}

//document.addEventListener('DOMContentLoaded', onScreenResize);
//window.addEventListener('resize', onScreenResize);

(function applyPaletteMode() {
    function setPaletteClass() {
        const body = document.body;
        if (!body) return;

        const params = new URLSearchParams(window.location.search);
        const paletteFromQuery = params.get('palette');
        let palette = localStorage.getItem('palette') || '2';

        if (paletteFromQuery) {
            if (paletteFromQuery === '2' || paletteFromQuery === 'palette-2' || paletteFromQuery === 'improved') {
                palette = '2';
            } else if (
                paletteFromQuery === '1' ||
                paletteFromQuery === 'palette-1' ||
                paletteFromQuery === 'improved-v1' ||
                paletteFromQuery === 'default'
            ) {
                palette = '1';
            }
            if (palette === '1' || palette === '2') {
                localStorage.setItem('palette', palette);
            }
        }

        body.classList.remove('palette-2');
        if (palette === '2') {
            body.classList.add('palette-2');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setPaletteClass);
    } else {
        setPaletteClass();
    }

    window.addEventListener('pageshow', setPaletteClass);
})();

(function initCopyHelpers() {
    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        }
    }

    function setButtonState(btn, successText) {
        const original = btn.dataset.label || btn.textContent;
        btn.textContent = successText;
        window.setTimeout(() => {
            btn.textContent = original;
        }, 1200);
    }

    function addHeadingCopyButtons() {
        const headings = document.querySelectorAll('main h2[id], main h3[id], main h4[id]');
        headings.forEach((heading) => {
            if (heading.querySelector('.heading-copy-link')) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'heading-copy-link';
            btn.dataset.label = '🔗';
            btn.textContent = '🔗';
            btn.setAttribute('aria-label', `Copy link to ${heading.textContent.trim()}`);
            btn.addEventListener('click', async () => {
                const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
                const ok = await copyText(url);
                if (ok) setButtonState(btn, '✓');
            });
            heading.appendChild(btn);
        });
    }

    function addCodeCopyButtons() {
        const blocks = document.querySelectorAll('div.highlight');
        blocks.forEach((block) => {
            if (block.querySelector('.code-copy-btn')) return;
            const code = block.querySelector('pre > code');
            if (!code) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'code-copy-btn';
            btn.dataset.label = 'Copy';
            btn.textContent = 'Copy';
            btn.setAttribute('aria-label', 'Copy code block');
            btn.addEventListener('click', async () => {
                const ok = await copyText(code.innerText);
                if (ok) setButtonState(btn, 'Copied');
            });
            block.appendChild(btn);
        });
    }

    function init() {
        addHeadingCopyButtons();
        addCodeCopyButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('pageshow', init);
})();

(function initReadingProgress() {
    function updateProgress(bar) {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollHeight = doc.scrollHeight - doc.clientHeight;
        const ratio = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
        bar.style.width = `${(ratio * 100).toFixed(2)}%`;
    }

    function init() {
        const body = document.body;
        if (!body || !body.classList.contains('is-article')) return;
        const bar = document.getElementById('reading-progress');
        if (!bar) return;

        const onScroll = () => updateProgress(bar);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        updateProgress(bar);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function initActivityGrid() {
    function createGrid(gridEl, rows, cols) {
        const values = new Array(rows * cols).fill(0);
        const frag = document.createDocumentFragment();
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

        for (let i = 0; i < values.length; i += 1) {
            const cell = document.createElement('span');
            cell.className = 'activity-grid-cell level-0';
            cell.setAttribute('aria-hidden', 'true');
            frag.appendChild(cell);
        }

        gridEl.appendChild(frag);
        return { values, cells: gridEl.children };
    }

    function applyLevel(cell, level) {
        cell.className = `activity-grid-cell level-${level}`;
    }

    function levelFromAge(age) {
        if (age <= 0) return 0;
        if (age === 1) return 1;
        if (age === 2) return 2;
        if (age === 3) return 3;
        return 4;
    }

    function countNeighbors(state, rows, cols, r, c) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr += 1) {
            for (let dc = -1; dc <= 1; dc += 1) {
                if (dr === 0 && dc === 0) continue;
                const rr = (r + dr + rows) % rows;
                const cc = (c + dc + cols) % cols;
                count += state[rr * cols + cc];
            }
        }
        return count;
    }

    function seedState(state, age, density) {
        for (let i = 0; i < state.length; i += 1) {
            const alive = Math.random() < density ? 1 : 0;
            state[i] = alive;
            age[i] = alive;
        }
    }

    function initOne(gridEl) {
        const rows = Math.max(4, Number.parseInt(gridEl.dataset.rows || '12', 10));
        const cols = Math.max(4, Number.parseInt(gridEl.dataset.cols || '12', 10));
        const interval = Math.max(120, Number.parseInt(gridEl.dataset.interval || '260', 10));
        const shouldAnimate = gridEl.dataset.animate === 'true';
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const seed = createGrid(gridEl, rows, cols);
        const cells = seed.cells;
        const size = rows * cols;
        const state = new Uint8Array(size);
        const age = new Uint8Array(size);
        const nextState = new Uint8Array(size);
        const nextAge = new Uint8Array(size);

        seedState(state, age, 0.26);
        for (let i = 0; i < size; i += 1) {
            applyLevel(cells[i], levelFromAge(age[i]));
        }

        if (!shouldAnimate || reduceMotion) return;

        window.setInterval(() => {
            let aliveCount = 0;
            for (let r = 0; r < rows; r += 1) {
                for (let c = 0; c < cols; c += 1) {
                    const idx = r * cols + c;
                    const alive = state[idx] === 1;
                    const neighbors = countNeighbors(state, rows, cols, r, c);

                    // Conway-style local evolution:
                    // survive on 2/3 neighbors, birth on exactly 3 neighbors.
                    const nextAlive = alive ? (neighbors === 2 || neighbors === 3) : neighbors === 3;
                    nextState[idx] = nextAlive ? 1 : 0;
                    nextAge[idx] = nextAlive ? Math.min(4, age[idx] + 1) : 0;
                    aliveCount += nextState[idx];
                }
            }

            // Light reseed to prevent permanent freeze/extinction on a tiny grid.
            if (aliveCount < 4 || aliveCount > Math.floor(size * 0.82)) {
                seedState(nextState, nextAge, 0.24);
            }

            for (let i = 0; i < size; i += 1) {
                state[i] = nextState[i];
                age[i] = nextAge[i];
                applyLevel(cells[i], levelFromAge(age[i]));
            }
        }, interval);
    }

    function init() {
        const grids = document.querySelectorAll('.activity-grid');
        if (!grids.length) return;
        grids.forEach(initOne);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function initGiscusMount() {
    function currentSiteTheme() {
        try {
            const saved = window.localStorage.getItem('theme');
            if (saved === 'dark-mode') return 'dark';
            if (saved === 'light-mode') return 'light';
        } catch (error) {
            // Fall through to DOM/system-based detection.
        }

        const body = document.body;
        if (body && body.classList.contains('dark-mode')) return 'dark';

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    function mapTheme(theme) {
        if (theme === 'dark-mode' || theme === 'dark') return 'dark';
        return 'light';
    }

    function mountOne(section, explicitTheme) {
        const mount = section.querySelector('.article-comments-mount');
        if (!mount) return;

        const theme = mapTheme(explicitTheme || currentSiteTheme());
        if (section.dataset.currentTheme === theme && mount.querySelector('iframe.giscus-frame')) {
            return;
        }

        mount.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.dataset.repo = section.dataset.repo || '';
        script.dataset.repoId = section.dataset.repoId || '';
        script.dataset.category = section.dataset.category || '';
        script.dataset.categoryId = section.dataset.categoryId || '';
        script.dataset.mapping = section.dataset.mapping || 'pathname';
        script.dataset.strict = section.dataset.strict || '0';
        script.dataset.reactionsEnabled = section.dataset.reactionsEnabled || '1';
        script.dataset.emitMetadata = section.dataset.emitMetadata || '0';
        script.dataset.inputPosition = section.dataset.inputPosition || 'top';
        script.dataset.theme = theme;
        script.dataset.lang = section.dataset.lang || 'en';
        script.dataset.loading = section.dataset.loading || 'lazy';
        mount.appendChild(script);
        section.dataset.currentTheme = theme;
    }

    function remountAll(explicitTheme) {
        const sections = document.querySelectorAll('.article-comments[data-comments-provider="giscus"]');
        if (!sections.length) return;
        sections.forEach((section) => mountOne(section, explicitTheme));
    }

    function init() {
        remountAll();
        window.addEventListener('site-theme-change', (event) => {
            const theme = event && event.detail ? event.detail.theme : undefined;
            remountAll(theme);
        });
        window.addEventListener('pageshow', () => remountAll());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function initVisualEmbeds() {
    let mermaidLoader = null;
    let chartLoader = null;

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
                if (existing.dataset.loaded === 'true') resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.addEventListener('load', () => {
                script.dataset.loaded = 'true';
                resolve();
            }, { once: true });
            script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
            document.head.appendChild(script);
        });
    }

    async function renderMermaid() {
        const blocks = Array.from(document.querySelectorAll('.viz-mermaid-block.mermaid'));
        if (!blocks.length) return;

        if (!mermaidLoader) {
            mermaidLoader = loadScript('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js');
        }
        await mermaidLoader;
        if (!window.mermaid) return;

        window.mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'neutral'
        });

        blocks.forEach((block) => {
            if (block.dataset.mermaidRendered === 'true') return;
            block.removeAttribute('data-processed');
            block.dataset.mermaidRendered = 'true';
        });

        await window.mermaid.run({
            querySelector: '.viz-mermaid-block.mermaid:not([data-processed])'
        });
    }

    async function renderCharts() {
        const canvases = Array.from(document.querySelectorAll('canvas.viz-chart-canvas[data-chart="true"]'));
        if (!canvases.length) return;

        if (!chartLoader) {
            chartLoader = loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js');
        }
        await chartLoader;
        if (!window.Chart) return;

        canvases.forEach((canvas) => {
            if (canvas.dataset.chartMounted === 'true') return;
            const encoded = canvas.dataset.chartConfig;
            if (!encoded) return;

            try {
                const raw = window.atob(encoded);
                const config = JSON.parse(raw);
                // eslint-disable-next-line no-new
                new window.Chart(canvas.getContext('2d'), config);
                canvas.dataset.chartMounted = 'true';
            } catch (error) {
                console.error('Invalid chart config for', canvas.id, error);
            }
        });
    }

    async function init() {
        await Promise.allSettled([renderMermaid(), renderCharts()]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('pageshow', init);
})();

(function initHeaderSearch() {
    const MIN_QUERY_LENGTH = 2;
    const MAX_RESULTS = 6;
    const PREPOPULATED_RESULTS = 3;
    let itemsCache = null;

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function buildHaystack(item) {
        const bits = [
            item.title,
            item.description,
            item.summary,
            (item.tags || []).join(' '),
            (item.categories || []).join(' ')
        ];
        return normalize(bits.join(' '));
    }

    async function loadItems(root) {
        if (itemsCache) return itemsCache;
        const indexUrl = root.dataset.searchIndex || '/index.json';
        const response = await fetch(indexUrl, { credentials: 'same-origin' });
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
        const payload = await response.json();
        const items = Array.isArray(payload?.items) ? payload.items : [];
        itemsCache = items.map((item) => ({ ...item, _haystack: buildHaystack(item) }));
        return itemsCache;
    }

    function clearResults(resultsEl) {
        resultsEl.innerHTML = '';
        resultsEl.hidden = true;
    }

    function renderResults(resultsEl, matches) {
        resultsEl.innerHTML = '';
        if (!matches.length) {
            const li = document.createElement('li');
            li.className = 'header-search-empty';
            li.textContent = 'No matching posts';
            resultsEl.appendChild(li);
            resultsEl.hidden = false;
            return;
        }

        matches.forEach((item) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = item.url;
            link.className = 'header-search-result-link';

            const title = document.createElement('span');
            title.className = 'header-search-result-title';
            title.textContent = item.title || '(untitled)';

            const meta = document.createElement('span');
            meta.className = 'header-search-result-meta';
            const tags = Array.isArray(item.tags) && item.tags.length ? ` • ${item.tags.slice(0, 2).join(', ')}` : '';
            meta.textContent = `${item.date || ''}${tags}`;

            link.appendChild(title);
            link.appendChild(meta);
            li.appendChild(link);
            resultsEl.appendChild(li);
        });
        resultsEl.hidden = false;
    }

    function searchItems(items, query) {
        const q = normalize(query);
        if (q.length < MIN_QUERY_LENGTH) return [];
        return items
            .filter((item) => item._haystack.includes(q))
            .slice(0, MAX_RESULTS);
    }

    function randomItems(items, count) {
        if (!items.length) return [];
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy.slice(0, count);
    }

    function initOne(root) {
        const input = root.querySelector('.header-search-input');
        const resultsEl = root.querySelector('[data-search-results]');
        const rerollButton = root.querySelector('[data-search-reroll]');
        if (!input || !resultsEl) return;

        let localItems = [];
        let loadFailed = false;

        const runSearch = () => {
            const q = input.value;
            const nq = normalize(q);

            if (!nq.length) {
                renderResults(resultsEl, randomItems(localItems, PREPOPULATED_RESULTS));
                return;
            }

            if (nq.length < MIN_QUERY_LENGTH) {
                clearResults(resultsEl);
                return;
            }
            const matches = searchItems(localItems, nq);
            renderResults(resultsEl, matches);
        };

        loadItems(root).then((items) => {
            localItems = items;
            // If user typed before index finished loading, populate results now.
            runSearch();
        }).catch(() => {
            loadFailed = true;
        });

        input.addEventListener('input', () => {
            if (loadFailed) {
                clearResults(resultsEl);
                return;
            }
            runSearch();
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                clearResults(resultsEl);
                input.blur();
            }
        });

        if (rerollButton) {
            rerollButton.addEventListener('click', () => {
                input.value = '';
                if (loadFailed) {
                    clearResults(resultsEl);
                    return;
                }
                renderResults(resultsEl, randomItems(localItems, PREPOPULATED_RESULTS));
                input.focus();
            });
        }

        document.addEventListener('click', (event) => {
            if (!root.contains(event.target)) clearResults(resultsEl);
        });
    }

    function init() {
        document.querySelectorAll('[data-search-root]').forEach(initOne);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function initArtifactFilters() {
    const FILTER_TO_PATH = {
        all: '/blog/artifacts/',
        build: '/blog/artifacts/builds/',
        guide: '/blog/artifacts/guides/',
        note: '/blog/artifacts/notes/'
    };

    function initOne(root) {
        const alreadyInitialized = root.dataset.artifactFiltersReady === 'true';
        const select = root.querySelector('[data-artifact-filter-select]');
        if (!select) return;

        function normalizePath(value) {
            if (!value) return '/';
            return value.endsWith('/') ? value : `${value}/`;
        }

        function setActiveFromLocation() {
            const currentPath = normalizePath(window.location.pathname.toLowerCase());
            const entries = Object.entries(FILTER_TO_PATH);
            const match = entries.find(([, path]) => normalizePath(path.toLowerCase()) === currentPath);
            select.value = match ? match[0] : 'all';
        }

        if (!alreadyInitialized) {
            const navigateFromSelect = () => {
                const next = FILTER_TO_PATH[(select.value || 'all').toLowerCase()] || FILTER_TO_PATH.all;
                const target = normalizePath(next);
                const current = normalizePath(window.location.pathname);
                if (target !== current) {
                    window.location.href = target;
                }
            };
            select.addEventListener('change', navigateFromSelect);
            select.addEventListener('input', navigateFromSelect);
            select.addEventListener('click', () => {
                window.setTimeout(setActiveFromLocation, 0);
            });
            root.dataset.artifactFiltersReady = 'true';
        }

        setActiveFromLocation();
    }

    function init() {
        document.querySelectorAll('[data-artifact-filters]').forEach(initOne);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('pageshow', init);
})();

(function initAiAssistButtons() {
    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        }
    }

    function buildPrompt(title, url) {
        return [
            `Help me learn this page: "${title}"`,
            `URL: ${url}`,
            '',
            'Please give:',
            '1) A concise summary.',
            '2) Key concepts and terms.',
            '3) Explore practical examples.',
            '4) Propose 3 follow-up questions I can ask the author.'
        ].join('\n');
    }

    function initOne(section) {
        const title = section.dataset.pageTitle || document.title || 'This page';
        const url = section.dataset.pageUrl || window.location.href;
        const note = section.querySelector('[data-ai-assist-note]');
        const toggle = section.querySelector('[data-ai-assist-toggle]');
        const actions = section.querySelector('[data-ai-assist-actions]');
        const buttons = section.querySelectorAll('[data-ai-provider]');
        const prompt = buildPrompt(title, url);

        if (toggle && actions) {
            toggle.addEventListener('click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                const next = !expanded;
                toggle.setAttribute('aria-expanded', next ? 'true' : 'false');
                actions.hidden = !next;
                if (!next && note) note.hidden = true;
            });
        }

        buttons.forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                const provider = button.dataset.aiProvider || 'AI tool';
                const template = button.dataset.aiUrlTemplate;
                let targetUrl = button.href;
                if (template) {
                    targetUrl = template
                        .replaceAll('%s', encodeURIComponent(prompt))
                        .replaceAll('%u', encodeURIComponent(url))
                        .replaceAll('%t', encodeURIComponent(title));
                }
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                const ok = await copyText(prompt);
                if (note) {
                    note.hidden = false;
                    const prefix = provider === 'Gemini'
                        ? 'Copied prompt (paste into Gemini; autofill is not reliable):'
                        : 'Copied prompt:';
                    note.textContent = `${prefix}\n\n${prompt}`;
                    if (!ok) {
                        note.textContent = `Clipboard copy failed. Use this prompt manually:\n\n${prompt}`;
                    }
                }
                if (toggle && actions) {
                    toggle.setAttribute('aria-expanded', 'true');
                    actions.hidden = false;
                }
            });
        });
    }

    function init() {
        document.querySelectorAll('[data-ai-assist]').forEach(initOne);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
