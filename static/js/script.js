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
