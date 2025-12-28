document.addEventListener("DOMContentLoaded", () => {
    initializeSheet();

    shortenTabTitles();
    applyTabZIndex();
    updateTabDisplay();

    resizeHorizontalScrollThumb();
    resizeVerticalScrollThumb();

    moveDivsIntoSheet();
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
            newRow.insertCell().outerHTML = `<td id="${colHeaders[j+1]}${i+1}"></td>`;
        }
    }
}

function moveDivsIntoSheet() {
    // console.log("Movign");
    // let test2 = document.getElementById("test2");

    // let B3 = document.getElementById("B3");

    // B3.appendChild(test2);
}


/**************************
**** CUSTOM SCROLLBARS ****
**************************/
// Scrollbar resizing
function resizeHorizontalScrollThumb() {
    let sheet_container = document.getElementById("sheet-container");
    let scrollTrack = document.getElementById("horizontal-scroll-track");
    let scrollThumb = document.getElementById("horizontal-scroll-thumb");

    // Update how wide the scroll thumb should be
    let ratio = sheet_container.clientWidth / sheet_container.scrollWidth;
    scrollThumb.style.width = `${ratio * scrollTrack.clientWidth}px`;
    scrollThumb.style.left = `${0}px`;
}
function resizeVerticalScrollThumb() {
    let sheet_container = document.getElementById("sheet-container");
    let scrollTrack = document.getElementById("vertical-scroll-track");
    let scrollThumb = document.getElementById("vertical-scroll-thumb");

    // Update how wide the scroll thumb should be
    let ratio = sheet_container.clientHeight / sheet_container.scrollHeight;
    scrollThumb.style.height = `${ratio * scrollTrack.clientHeight}px`;
    scrollThumb.style.top = `${0}px`;
}

window.addEventListener("resize", () => {
    resizeHorizontalScrollThumb();
    resizeVerticalScrollThumb();
});

// Scrollbar scrolling
let isHorizontalDragging = false;
let isVerticalDragging = false;
let startMousePos = null;
let startScrollPos = null;

function updateHorizontalScrollbarPosition(currentMouseX) {
    let scrollTrack = document.getElementById("horizontal-scroll-track");
    let scrollThumb = document.getElementById("horizontal-scroll-thumb");
    
    let xDiff = currentMouseX - startMousePos;
    
    let newLeft = startScrollPos + xDiff;
    newLeft = Math.max(newLeft, 0);
    newLeft = Math.min(newLeft, scrollTrack.clientWidth - parseInt(scrollThumb.style.width, 10));
    scrollThumb.style.left = `${newLeft}px`;
}
function updateVerticalScrollbarPosition(currentMouseY) {
    let scrollTrack = document.getElementById("vertical-scroll-track");
    let scrollThumb = document.getElementById("vertical-scroll-thumb");
    
    let yDiff = currentMouseY - startMousePos;
    
    let newTop = startScrollPos + yDiff;
    newTop = Math.max(newTop, 0);
    newTop = Math.min(newTop, scrollTrack.clientHeight - parseInt(scrollThumb.style.height, 10));
    scrollThumb.style.top = `${newTop}px`;
}

function updateSheetPosition() {
    let horizontalScrollTrack = document.getElementById("horizontal-scroll-track");
    let horizontalScrollThumb = document.getElementById("horizontal-scroll-thumb");
    let verticalScrollTrack = document.getElementById("vertical-scroll-track");
    let verticalScrollThumb = document.getElementById("vertical-scroll-thumb");
    let sheet_container = document.getElementById("sheet-container");

    // Get how far scrolled the scrollbars are
    let horizontalScrollbarRatio = parseInt(horizontalScrollThumb.style.left, 10) / horizontalScrollTrack.clientWidth;
    let verticalScrollbarRatio = parseInt(verticalScrollThumb.style.top, 10) / verticalScrollTrack.clientHeight;

    // Set sheet left to match the same ratios
    sheet_container.scrollLeft = horizontalScrollbarRatio * sheet_container.scrollWidth;
    sheet_container.scrollTop = verticalScrollbarRatio * sheet_container.scrollHeight;
}
function updateScrollPosition() {
    let horizontalScrollTrack = document.getElementById("horizontal-scroll-track");
    let horizontalScrollThumb = document.getElementById("horizontal-scroll-thumb");
    let verticalScrollTrack = document.getElementById("vertical-scroll-track");
    let verticalScrollThumb = document.getElementById("vertical-scroll-thumb");
    let sheet_container = document.getElementById("sheet-container");

    // Get how far scrolled the sheet is
    let horizontalSheetRatio = sheet_container.scrollLeft / sheet_container.scrollWidth;
    let verticalSheetRatio = sheet_container.scrollTop / sheet_container.scrollHeight;

    // Set sheet left to match the same ratios
    horizontalScrollThumb.style.left = `${horizontalSheetRatio * horizontalScrollTrack.scrollWidth}px`;
    verticalScrollThumb.style.top = `${verticalSheetRatio * verticalScrollTrack.scrollHeight}px`;
}

function handleHorizontalThumbDrag(e) {
    if (!isHorizontalDragging) {
        return;
    }

    let currentMouseX = e.x;
    updateHorizontalScrollbarPosition(currentMouseX);
    updateSheetPosition();
}
function handleVerticalThumbDrag(e) {
    if (!isVerticalDragging) {
        return;
    }

    let currentMouseY = e.y;
    updateVerticalScrollbarPosition(currentMouseY);
    updateSheetPosition();
}

document.getElementById("horizontal-scroll-thumb").addEventListener("mousedown", (e) => {
    isHorizontalDragging = true;
    startMousePos = e.pageX;
    startScrollPos = parseInt(document.getElementById("horizontal-scroll-thumb").style.left, 10);
    document.body.style.userSelect = "none";
});
document.getElementById("vertical-scroll-thumb").addEventListener("mousedown", (e) => {
    isVerticalDragging = true;
    startMousePos = e.pageY;
    startScrollPos = parseInt(document.getElementById("vertical-scroll-thumb").style.top, 10);
    document.body.style.userSelect = "none";
});
window.addEventListener("mouseup", (e) => {
    document.body.style.userSelect = "auto";
    isHorizontalDragging = false;
    isVerticalDragging = false;
    startMousePos = null;
    startScrollPos = null;
});
window.addEventListener("mousemove", (e) => {
    if (isHorizontalDragging && startMousePos != null && startScrollPos != null) {
        handleHorizontalThumbDrag(e);
    }
    if (isVerticalDragging && startMousePos != null && startScrollPos != null) {
        handleVerticalThumbDrag(e);
    }
});


document.getElementById("sheet-container").addEventListener("scroll", () => {
    updateScrollPosition();
})



/**************************
**** SCROLLBAR BUTTONS ****
**************************/
let isHolding = true;
let scrollTimerId = null;

function handleHorizontalScrollButton(sign, holding = false) {
    let scrollTrack = document.getElementById("horizontal-scroll-track");
    let scrollThumb = document.getElementById("horizontal-scroll-thumb");

    let scrollX = parseInt(document.getElementById("horizontal-scroll-thumb").style.left, 10);
    let fiftieth = scrollTrack.clientWidth / 50;

    let scale = holding ? 0.15 : 1;
    scale *= (sign == -1) ? 0.75 : 1;

    let newLeft = scrollX + sign * (scale * fiftieth);
    newLeft = Math.max(newLeft, 0);
    newLeft = Math.min(newLeft, scrollTrack.clientWidth - parseInt(scrollThumb.style.width, 10));
    newLeft = (sign == -1) ? Math.floor(newLeft) : Math.ceil(newLeft);
    scrollThumb.style.left = `${newLeft}px`;
    updateSheetPosition();
}
function handleVerticalScrollButton(sign, holding = false) {
    let scrollTrack = document.getElementById("vertical-scroll-track");
    let scrollThumb = document.getElementById("vertical-scroll-thumb");

    let scrollY = parseInt(document.getElementById("vertical-scroll-thumb").style.top, 10);
    let fiftieth = scrollTrack.clientHeight / 50;

    let scale = holding ? 0.15 : 1;
    // scale *= (sign == -1) ? 0.75 : 1;

    let newTop = scrollY + sign * (scale * fiftieth);
    newTop = Math.max(newTop, 0);
    newTop = Math.min(newTop, scrollTrack.clientHeight - parseInt(scrollThumb.style.height, 10));
    newTop = (sign == -1) ? Math.floor(newTop) : Math.ceil(newTop);
    scrollThumb.style.top = `${newTop}px`;
    updateSheetPosition();
}

function handleHoldHorizontalScroll(sign) {
    if (!isHolding) {
        return;
    }

    if (!scrollTimerId) {
        scrollTimerId = setInterval(() => {
            console.log("a")
            handleHorizontalScrollButton(sign, true);
        }, 5);
    }
}
function handleHoldVerticalScroll(sign) {
    if (!isHolding) {
        return;
    }

    if (!scrollTimerId) {
        scrollTimerId = setInterval(() => {
            console.log("a")
            handleVerticalScrollButton(sign, true);
        }, 5);
    }
}

document.getElementById("left-scroll-button").addEventListener("mousedown", () => {
    isHolding = true;

    // Do an initial scroll, then delay, then continuously scroll
    handleHorizontalScrollButton(-1);
    setTimeout(() => {
        handleHoldHorizontalScroll(-1);
    }, 300);
});
document.getElementById("right-scroll-button").addEventListener("mousedown", () => {
    isHolding = true;

    // Do an initial scroll, then delay, then continuously scroll
    handleHorizontalScrollButton(1);
    setTimeout(() => {
        handleHoldHorizontalScroll(1);
    }, 300);
});
document.getElementById("up-scroll-button").addEventListener("mousedown", () => {
    isHolding = true;

    // Do an initial scroll, then delay, then continuously scroll
    handleVerticalScrollButton(-1);
    setTimeout(() => {
        handleHoldVerticalScroll(-1);
    }, 300);
});
document.getElementById("down-scroll-button").addEventListener("mousedown", () => {
    isHolding = true;

    // Do an initial scroll, then delay, then continuously scroll
    handleVerticalScrollButton(1);
    setTimeout(() => {
        handleHoldVerticalScroll(1);
    }, 300);
});

document.addEventListener("mouseup", () => {
    isHolding = false;
    if (scrollTimerId) {
        clearInterval(scrollTimerId);
        scrollTimerId = null;
    }
});



/*******************
**** SHEET TABS ****
*******************/
/* Loading/Clicking tabs */
function shortenTabTitles() {
    let sheetTabs = document.querySelectorAll(".sheet-tab");
    for (let tab of sheetTabs) {
        // Crude way to limit overflow - limit sheet length to 8 characters (ok since using monospaced font)
        let anchor = tab.querySelector("a");
        if (anchor.innerText.length > 8) {
            anchor.innerText = anchor.innerText.slice(0, 7) + "…";
        }
    }
}
window.addEventListener("resize", () => {
    shortenTabTitles();
});

function applyTabZIndex() {
    let sheetTabs = document.querySelectorAll(".sheet-tab");
    sheetTabs.forEach((tab, i) => {
        tab.style.zIndex = sheetTabs.length - i + 1;
    })
}

function makeActiveTab(activeTab) {
    // Apply appropraite CSS classes
    let sheetTabs = document.querySelectorAll(".sheet-tab");
    sheetTabs.forEach((tab, i) => {
        tab.classList.remove("active-tab");
        tab.style.zIndex = sheetTabs.length - i + 1;
    })
    activeTab.classList.add("active-tab");
    activeTab.style.zIndex = 10;
}
document.querySelectorAll(".sheet-tab").forEach(tab => tab.addEventListener("click", function() {
    makeActiveTab(tab);
}));


/* Tab display buttons */
let firstTabDisplayedIndex = 0;
function updateTabDisplay() {
    // Update which 5 tabs are shown
    let sheetTabs = document.querySelectorAll(".sheet-tab")
    sheetTabs.forEach((tab, i) => {
        if (i >= firstTabDisplayedIndex && i < firstTabDisplayedIndex + 5) {
            tab.classList.remove("hidden");
        }
        else {
            tab.classList.add("hidden");
        }
    });

    // Update tab selection buttons
    if (firstTabDisplayedIndex == 0) {
        document.getElementById("first-sheet-button").disabled = true;
        document.getElementById("previous-sheet-button").disabled = true;
        document.getElementById("next-sheet-button").disabled = false;
        document.getElementById("last-sheet-button").disabled = false;
    }
    else if (firstTabDisplayedIndex == (sheetTabs.length - 5)) {
        document.getElementById("first-sheet-button").disabled = false;
        document.getElementById("previous-sheet-button").disabled = false;
        document.getElementById("next-sheet-button").disabled = true;
        document.getElementById("last-sheet-button").disabled = true;
    }
    else {
        document.getElementById("first-sheet-button").disabled = false;
        document.getElementById("previous-sheet-button").disabled = false;
        document.getElementById("next-sheet-button").disabled = false;
        document.getElementById("last-sheet-button").disabled = false;
    }
}

document.getElementById("first-sheet-button").addEventListener("click", () => {
    firstTabDisplayedIndex = 0;
    updateTabDisplay();
});
document.getElementById("previous-sheet-button").addEventListener("click", () => {
    firstTabDisplayedIndex = Math.max(0, --firstTabDisplayedIndex);
    updateTabDisplay();
});
document.getElementById("next-sheet-button").addEventListener("click", () => {
    firstTabDisplayedIndex = Math.min(document.querySelectorAll(".sheet-tab").length - 5, ++firstTabDisplayedIndex);
    updateTabDisplay();
});
document.getElementById("last-sheet-button").addEventListener("click", () => {
    firstTabDisplayedIndex = document.querySelectorAll(".sheet-tab").length - 5;
    updateTabDisplay();
});


function toggleSheetDropdown() {
    this.classList.toggle("down-button");
    this.classList.toggle("up-button");
    document.getElementById("sheet-dropdown-menu").classList.toggle("hidden");
}
document.getElementById("sheet-selector-dropdown").addEventListener("click", toggleSheetDropdown);
document.getElementById("sheet-selector-input").addEventListener("click", toggleSheetDropdown);