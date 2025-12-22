document.addEventListener("DOMContentLoaded", () => {
    initializeSheet();
    resizeScrollThumb();
});

function initializeSheet() {
    let sheet = document.getElementById("sheet");

    // Add column header
    let headerRow = sheet.insertRow(-1);
    let colHeaders = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < colHeaders.length; i++) {
        headerRow.insertCell().outerHTML = `<th class="horizontal-header">${colHeaders[i]}</th>`;
    }

    // Add rows
    for (let i = 0; i < 99; i++) {
        let newRow = sheet.insertRow(-1);
        newRow.insertCell().outerHTML = `<th class="vertical-header">${i+1}</th>`;
        for (let j = 0; j < colHeaders.length - 1; j++) {
            newRow.insertCell().innerHTML = "";
        }
    }
}


/*************************
**** CUSTOM SCROLLBAR ****
*************************/
// Scrollbar resizing
function resizeScrollThumb() {
    let sheet_container = document.querySelector("main");
    let scrollTrack = document.getElementById("scroll-track");
    let scrollThumb = document.getElementById("scroll-thumb");

    // Update how wide the scroll thumb should be
    let ratio = sheet_container.clientWidth / sheet_container.scrollWidth;
    scrollThumb.style.width = `${ratio * scrollTrack.clientWidth}px`;
    scrollThumb.style.left = `${0}px`;

    // Update where the scroll thumb should start
}

window.addEventListener("resize", resizeScrollThumb);


// Scrollbar scrolling
let isDragging = false;
let startMouseX = null;
let startScrollX = null;

function updateScrollbarPosition(currentMouseX) {
    let scrollTrack = document.getElementById("scroll-track");
    let scrollThumb = document.getElementById("scroll-thumb");
    
    let xDiff = currentMouseX - startMouseX;
    
    let newLeft = startScrollX + xDiff;
    newLeft = Math.max(newLeft, 0);
    newLeft = Math.min(newLeft, scrollTrack.clientWidth - parseInt(scrollThumb.style.width, 10));
    scrollThumb.style.left = `${newLeft}px`;
}

function updateSheetPosition() {
    let scrollTrack = document.getElementById("scroll-track");
    let scrollThumb = document.getElementById("scroll-thumb");
    let sheet_container = document.querySelector("main");

    // Get how far scrolled the scrollbar is
    let scrollbarRatio = parseInt(scrollThumb.style.left, 10) / scrollTrack.clientWidth;

    // Set sheet left to match the same ratio
    sheet_container.scrollLeft = scrollbarRatio * (sheet_container.scrollWidth);
}

function handleThumbDrag(e) {
    if (!isDragging) {
        return;
    }

    let currentMouseX = e.x;

    updateScrollbarPosition(currentMouseX);
    updateSheetPosition();
}

document.getElementById("scroll-thumb").addEventListener("mousedown", (e) => {
    isDragging = true;
    startMouseX = e.pageX;
    startScrollX = parseInt(document.getElementById("scroll-thumb").style.left, 10);
    document.body.style.userSelect = "none";
});
window.addEventListener("mouseup", (e) => {
    isDragging = false;
    startMouseX = null;
    startScrollX = null;
    document.body.style.userSelect = "auto";
});
window.addEventListener("mousemove", (e) => {
    if (startMouseX != null && startScrollX != null) {
        handleThumbDrag(e);
    }
});


// Scrolbar buttons
let isHolding = true;
let scrollTimerId = null;

function handleScrollButton(sign, holding = false) {
    let scrollTrack = document.getElementById("scroll-track");
    let scrollThumb = document.getElementById("scroll-thumb");

    let scrollX = parseInt(document.getElementById("scroll-thumb").style.left, 10);
    let fiftieth = scrollTrack.clientWidth / 50;

    let scale = holding ? 0.15 : 1;
    scale *= (sign == -1) ? 0.75 : 1;

    let newLeft = scrollX + sign * (scale * fiftieth);
    newLeft = Math.max(newLeft, 0);
    newLeft = Math.min(newLeft, scrollTrack.clientWidth - parseInt(scrollThumb.style.width, 10));
    scrollThumb.style.left = `${newLeft}px`;
    updateSheetPosition();
}

function handleHoldScroll(sign) {
    if (!isHolding) {
        return;
    }

    if (!scrollTimerId) {
        scrollTimerId = setInterval(() => {
            handleScrollButton(sign, true);
        }, 5);
    }
}

document.getElementById("left-scroll-button").addEventListener("mousedown", () => {
    isHolding = true;
    counter = 0;
    delme = Date.now();

    // Do an initial scroll, then delay, then continuously scroll
    handleScrollButton(-1);
    setTimeout(() => {
        handleHoldScroll(-1);
    }, 300);
});
document.getElementById("right-scroll-button").addEventListener("mousedown", () => {
    isHolding = true;
    counter = 0;
    delme = Date.now();

    // Do an initial scroll, then delay, then continuously scroll
    handleScrollButton(1);
    setTimeout(() => {
        handleHoldScroll(1);
    }, 300);
});

document.addEventListener("mouseup", () => {
    isHolding = false;
    if (scrollTimerId) {
        clearInterval(scrollTimerId);
        scrollTimerId = null;
    }
});
