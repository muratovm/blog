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
        let palette = localStorage.getItem('palette');

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
