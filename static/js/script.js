function goUpDirectory() {
    // Remove any #hash
    const url = window.location.href.split('#')[0];
    const urlObj = new URL(url);
  
    // Clean the path
    let path = urlObj.pathname;
    if (path.endsWith('/')) {
      path = path.slice(0, -1); // remove trailing slash
    }
  
    // Go up one directory
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
  
    // Rebuild the URL
    urlObj.pathname = parentPath;
    urlObj.hash = ''; // ensure no leftover hashes
  
    // Redirect
    window.location.href = urlObj.href;
  }

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