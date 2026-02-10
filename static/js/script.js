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
