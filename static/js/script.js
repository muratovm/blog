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
