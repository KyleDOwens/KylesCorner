document.addEventListener("DOMContentLoaded", () => {
    // Dispatch a 'resize' event to: (1) resize the mock grid, (2) resize the scrollbars, (3) resize the book container
    window.dispatchEvent(new Event('resize'));

    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 200);
});