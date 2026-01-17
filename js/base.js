/*-- ================================================ --->
<---                   INITIALIZATION                 --->
<--- ================================================ --*/
//#region INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    initializeSheet();

    shortenTabTitles();
    applyTabZIndex();
    updateTabDisplay();

    getAllScrollbars();
    addScrollbarListeners();
    addScrollbarButtonListeners();
    resizeHorizontalScrollThumbs();
    resizeVerticalScrollThumbs();

    handlePageLoad();
});


/**
 * Initializes the mock excel sheet by adding in header elements
 */
function initializeSheet() {
    // Add column headers
    let mockHorizontalHeader = document.getElementById("mock-hheader");
    let colHeaders = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < colHeaders.length; i++) {
        let headerCell = document.createElement("span");
        headerCell.classList.add("horizontal-header");
        headerCell.id = `${colHeaders[i]}0`;
        headerCell.innerHTML = `${colHeaders[i]}`;
        mockHorizontalHeader.appendChild(headerCell);
    }

    // Add row headers
    let mockVerticalHeader = document.getElementById("mock-vheader");
    for (let i = 0; i <= 99; i++) {
        let headerCell = document.createElement("span");
        headerCell.classList.add("vertical-header");
        headerCell.id = `_${i}`;
        headerCell.innerHTML = `${i}`;
        mockVerticalHeader.appendChild(headerCell);
    }
}
//#endregion INITIALIZATION


/*-- ================================================ --->
<---                 CUSTOM SCROLLBARS                --->
<--- ================================================ --*/
//#region SCROLLBARS
/**
 * Store the prefix values for the various custom scrollbars
 * 
 * NOTE TO SELF: Maybe refactor this at some point in the future? 
 * This is done this way to abstract away all the listeners/logic for scrollbar function
 * Essentially, each scrollbar and associated elements (see structure below) follow the same HTML structure
 * They should also follow the outlined ID naming scheme below, where the only different between scrollbars is their prefix
 * That allows me to just get all the prefixes on webpage load, and add listeners/handlers to each associated element as needed
 * It also allows me to still identify which specific scrollbar is being clicked, or which specific content is being scrolled
 * 
 * Each scrollbar should be implemented in the following way:
 * 
 *     <div class="scroll-and-content">
 *         <div class="scroll-container" id="prefix-scroll-container">
 *             ...scroll content...
 *         </div>
 *         <div class="vertical-scrollbar" id="prefix-vertical-scrollbar">
 *             <button class="square-button up-button" id="prefix-up-scroll-button"></button>
 *             <div class="scroll-track" id="prefix-vertical-scroll-track">
 *                 <div class="scroll-thumb" id="prefix-vertical-scroll-thumb"></div>
 *             </div>
  *            <button class="square-button down-button" id="prefix-down-scroll-button"></button>
 *         </div>
 *     </div>
 * 
 * I haven't tested adding multiple horizontal scrollbars, but the concept should be the same
 */
let horizontalScrollbars = [];
let verticalScrollbars = [];

/**
 * Gets the prefixes for each custom scrollbar on the webpage
 */
function getAllScrollbars() {
    let hScrollbars = document.querySelectorAll(".horizontal-scrollbar");
    let vScrollbars = document.querySelectorAll(".vertical-scrollbar");

    hScrollbars.forEach((container) => {
        let prefix = container.dataset.prefix;
        horizontalScrollbars.push(prefix);
    })

    vScrollbars.forEach((container) => {
        let prefix = container.dataset.prefix;
       verticalScrollbars.push(prefix);
    })

    console.log("scrollbars:");
    for (let h of horizontalScrollbars) {
        console.log(`h : ${h}`);
    }
    for (let v of verticalScrollbars) {
        console.log(`v : ${v}`);
    }
}

/**
 * Gets the prefix value from the given ID string
 * @param {*} id the ID string to get the prefix from
 * @returns the prefix string
 */
function getPrefixFromId(id) {
    return id.substring(0, id.indexOf("-"));
}

/**
 * Constants used for storing state info when dragging a scrollbar
 */
let isHorizontalDragging = false;
let isVerticalDragging = false;
let startMousePos = null;
let startScrollPos = null;
let activeScrollPrefix = null;

/**
 * Resizes the horizontal scrollbars according to the screen size
 */
function resizeHorizontalScrollThumbs() {
    for (let prefix of horizontalScrollbars) {
        let scrollContainer = document.getElementById(`${prefix}-scroll-container`);
        let scrollTrack = document.getElementById(`${prefix}-horizontal-scroll-track`);
        let scrollThumb = document.getElementById(`${prefix}-horizontal-scroll-thumb`);

        // Update how wide the scroll thumb should be
        let ratio = scrollContainer.clientWidth / scrollContainer.scrollWidth;
        scrollThumb.style.width = `${ratio * scrollTrack.clientWidth}px`;
        scrollThumb.style.left = `${0}px`;
    }
}
/**
 * Resizes the vertical scrollbars according to the screen size
 */
function resizeVerticalScrollThumbs() {
    for (let prefix of verticalScrollbars) {
        let scrollContainer = document.getElementById(`${prefix}-scroll-container`);
        let scrollTrack = document.getElementById(`${prefix}-vertical-scroll-track`);
        let scrollThumb = document.getElementById(`${prefix}-vertical-scroll-thumb`);

        // Update how wide the scroll thumb should be
        let ratio = scrollContainer.clientHeight / scrollContainer.scrollHeight;
        scrollThumb.style.height = `${ratio * scrollTrack.clientHeight}px`;
        scrollThumb.style.top = `${0}px`;
    }
}
window.addEventListener("resize", () => {
    resizeHorizontalScrollThumbs();
    resizeVerticalScrollThumbs();
});

/**
 * Updates where the horizontal scroll thumb is within the track, depending on where the user's mouse currently is
 * @param {*} currentMouseX Current x position of the user's mouse
 */
function updateHorizontalScrollbarPosition(currentMouseX) {
    let scrollTrack = document.getElementById(`${activeScrollPrefix}-horizontal-scroll-track`);
    let scrollThumb = document.getElementById(`${activeScrollPrefix}-horizontal-scroll-thumb`);
    
    let xDiff = currentMouseX - startMousePos;
    
    let newLeft = startScrollPos + xDiff;
    newLeft = Math.max(newLeft, 0);
    newLeft = Math.min(newLeft, scrollTrack.clientWidth - parseInt(scrollThumb.style.width, 10));
    scrollThumb.style.left = `${newLeft}px`;
}
/**
 * Updates where the vertical scroll thumb is within the track, depending on where the user's mouse currently is
 * @param {*} currentMouseY Current y position of the user's mouse
 */
function updateVerticalScrollbarPosition(currentMouseY) {
    let scrollTrack = document.getElementById(`${activeScrollPrefix}-vertical-scroll-track`);
    let scrollThumb = document.getElementById(`${activeScrollPrefix}-vertical-scroll-thumb`);
    
    let yDiff = currentMouseY - startMousePos;
    
    let newTop = startScrollPos + yDiff;
    newTop = Math.max(newTop, 0);
    newTop = Math.min(newTop, scrollTrack.clientHeight - parseInt(scrollThumb.style.height, 10));
    scrollThumb.style.top = `${newTop}px`;
}

/**
 * Updates the current view of the sheet, depending on how far the horizontal and vertical thumbs are scrolled.
 * Called when the user scrolls using the scrollbars
 */
function updateScrollContainerPosition() {
    let horizontalScrollTrack = document.getElementById(`${activeScrollPrefix}-horizontal-scroll-track`);
    let horizontalScrollThumb = document.getElementById(`${activeScrollPrefix}-horizontal-scroll-thumb`);
    let verticalScrollTrack = document.getElementById(`${activeScrollPrefix}-vertical-scroll-track`);
    let verticalScrollThumb = document.getElementById(`${activeScrollPrefix}-vertical-scroll-thumb`);
    let scrollContainer = document.getElementById(`${activeScrollPrefix}-scroll-container`);

    // Get how far scrolled the scrollbars are and set sheet left to match the same ratios
    if (horizontalScrollTrack != null) {
        let horizontalScrollbarRatio = parseInt(horizontalScrollThumb.style.left, 10) / horizontalScrollTrack.clientWidth;
        scrollContainer.scrollLeft = horizontalScrollbarRatio * scrollContainer.scrollWidth;
    }
    if (verticalScrollTrack != null) {
        let verticalScrollbarRatio = parseInt(verticalScrollThumb.style.top, 10) / verticalScrollTrack.clientHeight;
        scrollContainer.scrollTop = verticalScrollbarRatio * scrollContainer.scrollHeight;
    }
}
/**
 * Updates the position of the horizontal and vertical scrollbar thumbs, depending on the current view of the sheet.
 * Is called when the user scrolls using their mouse (or finger on mobile)
 */
function updateThumbPositions(prefix) {
    /**
     * The reason this takes a prefix parameter and all other functions use the global value, is because this is called when the user scrolls with their mouse AND when the user is dragging the scroll thumb
     * The activeScrollbarPrefix is not set when using mouse scroll, and since there is no way for me to differentiate between the two easily, I have to pass in the value just to be safe
     */
    let horizontalScrollTrack = document.getElementById(`${prefix}-horizontal-scroll-track`);
    let horizontalScrollThumb = document.getElementById(`${prefix}-horizontal-scroll-thumb`);
    let verticalScrollTrack = document.getElementById(`${prefix}-vertical-scroll-track`);
    let verticalScrollThumb = document.getElementById(`${prefix}-vertical-scroll-thumb`);
    let scrollContainer = document.getElementById(`${prefix}-scroll-container`);

    // Get how far scrolled the sheet is and set sheet left to match the same ratios
    if (horizontalScrollTrack != null) {
        let horizontalSheetRatio = scrollContainer.scrollLeft / scrollContainer.scrollWidth;
        horizontalScrollThumb.style.left = `${horizontalSheetRatio * horizontalScrollTrack.scrollWidth}px`;
    }
    if (verticalScrollTrack != null) {
        let verticalSheetRatio = scrollContainer.scrollTop / scrollContainer.scrollHeight;
        verticalScrollThumb.style.top = `${verticalSheetRatio * verticalScrollTrack.scrollHeight}px`;
    }
}

/**
 * Handler for when horizonal scrollbar thumb is being dragged
 * @param {*} e The listener event object
 */
function handleHorizontalThumbDrag(e) {
    if (!isHorizontalDragging) {
        return;
    }

    let currentMouseX = e.x;
    updateHorizontalScrollbarPosition(currentMouseX);
    updateScrollContainerPosition();
}
/**
 * Handler for when vertical scrollbar thumb is being dragged
 * @param {*} e The listener event object
 */
function handleVerticalThumbDrag(e) {
    if (!isVerticalDragging) {
        return;
    }

    let currentMouseY = e.y;
    updateVerticalScrollbarPosition(currentMouseY);
    updateScrollContainerPosition();
}

/**
 * Listeners for when the user drags a scrollbar thumb, or scrolls the sheet with their mouse (or finger on mobile)
 */
function addScrollbarListeners() {
    for (let prefix of horizontalScrollbars) {
        document.getElementById(`${prefix}-horizontal-scroll-thumb`).addEventListener("mousedown", (e) => {
            isHorizontalDragging = true;
            startMousePos = e.pageX;
            startScrollPos = parseInt(document.getElementById(`${prefix}-horizontal-scroll-thumb`).style.left, 10);
            activeScrollPrefix = getPrefixFromId(e.target.id);
            document.body.style.userSelect = "none";
        });
    }

    for (let prefix of verticalScrollbars) {
        document.getElementById(`${prefix}-vertical-scroll-thumb`).addEventListener("mousedown", (e) => {
            isVerticalDragging = true;
            startMousePos = e.pageY;
            startScrollPos = parseInt(document.getElementById(`${prefix}-vertical-scroll-thumb`).style.top, 10);
            activeScrollPrefix = getPrefixFromId(e.target.id);
            document.body.style.userSelect = "none";
        });
    }

    let union = horizontalScrollbars.concat(verticalScrollbars).filter((value, index, arr) => arr.indexOf(value) === index);
    for (let prefix of union) {
        document.getElementById(`${prefix}-scroll-container`).addEventListener("scroll", (e) => {
            updateThumbPositions(getPrefixFromId(e.target.id));
        });
    }
        
}
window.addEventListener("mouseup", (e) => {
    document.body.style.userSelect = "auto";
    isHorizontalDragging = false;
    isVerticalDragging = false;
    startMousePos = null;
    startScrollPos = null;
    activeScrollPrefix = null;
});
window.addEventListener("mousemove", (e) => {
    if (isHorizontalDragging && startMousePos != null && startScrollPos != null) {
        handleHorizontalThumbDrag(e);
    }
    if (isVerticalDragging && startMousePos != null && startScrollPos != null) {
        handleVerticalThumbDrag(e);
    }
});
//#endregion SCROLLBARS


/*-- ================================================ --->
<---                 SCROLLBAR BUTTONS                --->
<--- ================================================ --*/
//#region SCROLLBAR_BUTTONS
/**
 * Constants used for storing state info when a scrollbar scroll button is held
 */
let isHolding = true;
let scrollTimerId = null;

/**
 * Handles a single instance of the horizontal scrollbar button being pressed.
 * Will be repeatedly called when the button is held down.
 * @param {*} sign +1 or -1, indicating which direction the movement is occuring
 * @param {*} holding Boolean indicating if the button is being held or not
 */
function handleHorizontalScrollButton(sign, holding = false) {
    let scrollTrack = document.getElementById(`${activeScrollPrefix}-horizontal-scroll-track`);
    let scrollThumb = document.getElementById(`${activeScrollPrefix}-horizontal-scroll-thumb`);

    let scrollX = parseInt(document.getElementById(`${activeScrollPrefix}-horizontal-scroll-thumb`).style.left, 10);
    let fiftieth = scrollTrack.clientWidth / 50;

    // Scale the distance scrolled depending on if this is a one time press, or a continuous press
    let scale = holding ? 0.15 : 1;

    // Calculate the new location of the thumb so it does not exceed the track boundaries
    let newLeft = scrollX + sign * (scale * fiftieth);
    newLeft = Math.max(newLeft, 0);
    newLeft = Math.min(newLeft, scrollTrack.clientWidth - parseInt(scrollThumb.style.width, 10));
    newLeft = (sign == -1) ? Math.floor(newLeft) : Math.ceil(newLeft);
    scrollThumb.style.left = `${newLeft}px`;
    updateScrollContainerPosition();
}
/**
 * Handles a single instance of the vertical scrollbar button being pressed.
 * Will be repeatedly called when the button is held down.
 * @param {*} sign +1 or -1, indicating which direction the movement is occuring
 * @param {*} holding Boolean indicating if the button is being held or not
 */
function handleVerticalScrollButton(sign, holding = false) {
    let scrollTrack = document.getElementById(`${activeScrollPrefix}-vertical-scroll-track`);
    let scrollThumb = document.getElementById(`${activeScrollPrefix}-vertical-scroll-thumb`);

    let scrollY = parseInt(document.getElementById(`${activeScrollPrefix}-vertical-scroll-thumb`).style.top, 10);
    let fiftieth = scrollTrack.clientHeight / 50;

    // Scale the distance scrolled depending on if this is a one time press, or a continuous press
    let scale = holding ? 0.15 : 1;

    // Calculate the new location of the thumb so it does not exceed the track boundaries
    let newTop = scrollY + sign * (scale * fiftieth);
    newTop = Math.max(newTop, 0);
    newTop = Math.min(newTop, scrollTrack.clientHeight - parseInt(scrollThumb.style.height, 10));
    newTop = (sign == -1) ? Math.floor(newTop) : Math.ceil(newTop);
    scrollThumb.style.top = `${newTop}px`;
    updateScrollContainerPosition();
}

/**
 * Handler for when the horizontal scrollbar button is pressed
 * @param {*} sign +1 or -1, indicating which direction the movement is occuring
 */
function handleHoldHorizontalScroll(sign) {
    if (!isHolding) {
        return;
    }

    if (!scrollTimerId) {
        scrollTimerId = setInterval(() => {
            handleHorizontalScrollButton(sign, true);
        }, 5);
    }
}
/**
 * Handler for when the vertical scrollbar button is pressed
 * @param {*} sign +1 or -1, indicating which direction the movement is occuring
 */
function handleHoldVerticalScroll(sign) {
    if (!isHolding) {
        return;
    }

    if (!scrollTimerId) {
        scrollTimerId = setInterval(() => {
            handleVerticalScrollButton(sign, true);
        }, 5);
    }
}

/**
 * Listeners for when the user clicks/holds a scrollbar movement button
 */
function addScrollbarButtonListeners() {
    for (let prefix of horizontalScrollbars) {
        document.getElementById(`${prefix}-left-scroll-button`).addEventListener("mousedown", (e) => {
            isHolding = true;
            activeScrollPrefix = getPrefixFromId(e.target.id);

            // Do an initial scroll, then delay, then continuously scroll
            handleHorizontalScrollButton(-1);
            setTimeout(() => {
                handleHoldHorizontalScroll(-1);
            }, 300);
        });
        document.getElementById(`${prefix}-right-scroll-button`).addEventListener("mousedown", (e) => {
            isHolding = true;
            activeScrollPrefix = getPrefixFromId(e.target.id);

            // Do an initial scroll, then delay, then continuously scroll
            handleHorizontalScrollButton(1);
            setTimeout(() => {
                handleHoldHorizontalScroll(1);
            }, 300);
        });
    }

    for (let prefix of verticalScrollbars) {
        document.getElementById(`${prefix}-up-scroll-button`).addEventListener("mousedown", (e) => {
            isHolding = true;
            activeScrollPrefix = getPrefixFromId(e.target.id);

            // Do an initial scroll, then delay, then continuously scroll
            handleVerticalScrollButton(-1);
            setTimeout(() => {
                handleHoldVerticalScroll(-1);
            }, 300);
        });
        document.getElementById(`${prefix}-down-scroll-button`).addEventListener("mousedown", (e) => {
            isHolding = true;
            activeScrollPrefix = getPrefixFromId(e.target.id);

            // Do an initial scroll, then delay, then continuously scroll
            handleVerticalScrollButton(1);
            setTimeout(() => {
                handleHoldVerticalScroll(1);
            }, 300);
        });
    }
}

document.addEventListener("mouseup", () => {
    isHolding = false;
    activeScrollPrefix = null;
    if (scrollTimerId) {
        clearInterval(scrollTimerId);
        scrollTimerId = null;
    }
});
//#endregion SCROLLBAR_BUTTONS


/*-- ================================================ --->
<---                     SHEET TABS                   --->
<--- ================================================ --*/
//#region SHEET_TABS
let NUM_TABS_SHOWN = 5;

/**
 * Shortens the text within the page tabs if they are too long
 */
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

    let screenWidth = window.innerWidth;
    if (screenWidth < 360) {
        NUM_TABS_SHOWN = 1;
    }
    else if (screenWidth < 450) {
        NUM_TABS_SHOWN = 2;
    }
    else if (screenWidth < 600) {
        NUM_TABS_SHOWN = 3;
    }
    else if (screenWidth < 800) {
        NUM_TABS_SHOWN = 4;
    }
    else {
        NUM_TABS_SHOWN = 5;
    }

    updateTabDisplay();
});

/**
 * Applies z-index values to the tabs so they appear cascading 
 */
function applyTabZIndex() {
    let sheetTabs = document.querySelectorAll(".sheet-tab");
    sheetTabs.forEach((tab, i) => {
        tab.style.zIndex = sheetTabs.length - i + 1;
    })
}

/**
 * Makes the passed in tab the "active tab" - updates the classes of each tab to match their new state
 * @param {*} activeTab The clicked on tab HTML element
 */
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

/**
 * Updates which of the 5 tabs are currently displayed at the bottom of the website
 */
let firstTabDisplayedIndex = 0;
function updateTabDisplay() {
    // Update which 5 tabs are shown
    let sheetTabs = document.querySelectorAll(".sheet-tab")
    sheetTabs.forEach((tab, i) => {
        if (i >= firstTabDisplayedIndex && i < firstTabDisplayedIndex + NUM_TABS_SHOWN) {
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

/**
 * Listeners to handle the tab selection buttons being pressed
 */
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

/**
 * Handles the toggling of the <current sheet> dropdown menu
 */
function toggleSheetDropdown() {
    this.classList.toggle("down-button");
    this.classList.toggle("up-button");
    document.getElementById("sheet-dropdown-menu").classList.toggle("hidden");
}
document.getElementById("sheet-selector-dropdown").addEventListener("click", toggleSheetDropdown);
document.getElementById("long-sheet-selector-input").addEventListener("click", toggleSheetDropdown);
document.getElementById("short-sheet-selector-input").addEventListener("click", toggleSheetDropdown);

/**
 * Updates the dropdown and sheet tabs on page load
 */
function handlePageLoad() {
    // Get the current page name
    let pageName = window.location.pathname.slice(window.location.pathname.lastIndexOf("/") + 1, window.location.pathname.indexOf(".html"));

    // Update the dropdown item classes
    document.querySelectorAll("#sheet-dropdown-menu .sheet-link").forEach(sheetLink => {
        let dropdownItem = sheetLink.children[0];
        if (dropdownItem.innerHTML == pageName) {
            dropdownItem.classList.add("dropdown-selected");
        }
        else {
            dropdownItem.classList.remove("dropdown-selected");
        }
    });

    // Find corresponding tab
    let pageTab = null;
    document.querySelectorAll(".sheet-tab").forEach(tab => {
        let sheetLink = tab.children[0];
        if (sheetLink.dataset.title == pageName) {
            pageTab = tab;
        }
    });

    // Update active tab
    if (pageTab != null) {
        makeActiveTab(pageTab);
    }
    else {
        console.log("ERROR: Could not find corresponding tab for loaded page");
    }
}
//#endregion SHEET_TABS