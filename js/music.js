const OLDEST_YEAR = 2018;
const NEWEST_YEAR = 2025;
const DEFAULT_YEAR = 2025;

let currentYear = DEFAULT_YEAR;
let currentList = "Albums"

// Spotify playlist links (note not all years/lists combos have playlists)
const PLAYLIST_LINKS = {
    "Albums 2025" : "https://open.spotify.com/playlist/0Q6k70RNa5yfCzR7FoWZJT?si=088be65e8d3d4ad1",
    "Songs 2025" : "https://open.spotify.com/playlist/78N72f5j0mTbZOkbTlPAJH?si=18c024ca5f964778",
    "Albums 2024" : "https://open.spotify.com/playlist/0MATwTyjzRLJT9rhMKwM6S?si=5e28ec4d25564422",
    "Songs 2024" : "https://open.spotify.com/playlist/7nzU9D67SJdgd41dLbRwcf?si=18384ce1a1d54f9d",
    "Albums 2023" : "https://open.spotify.com/playlist/01jDUCJ4Z4c2No5bijVJKw?si=2e76605284f64e8e",
    "Songs 2023" : "https://open.spotify.com/playlist/4SLr4bfpWLHQGyQzKonxjE?si=35409659241941f0",
    "Albums 2022" : "https://open.spotify.com/playlist/7jwCBOFBCl1BrwmkPrPLBr?si=099649841fa54b03",
    "Songs 2022" : "https://open.spotify.com/playlist/1JGn9zna2lNdGRklbuOlUX?si=eea92f25e4d44292",
    "Albums 2021" : "https://open.spotify.com/playlist/0T0mqDU2EjiHQaDFIJm79V?si=ff7af6c9a10449a9",
    "Albums 2020" : "https://open.spotify.com/playlist/3UXyXqHD527llczssqr3TK?si=6a27492ae6ec4ad1",
    "Albums 2019" : "https://open.spotify.com/playlist/3v253ZQ652keRJmdDJy0Sb?si=edfb8d65f1c342b1",
    "Albums 2018" : "https://open.spotify.com/playlist/2khHeRdQA4tF096H1LNX08?si=f7691f6956294331",
}


/*-- ================================================ --->
<---                  INITIALIZATION                  --->
<--- ================================================ --*/
/**
 * Initializes the page on load
 */
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => { updateDisplay(); }, 10); // Add a small delay so this starts initializing after the base
    setActiveYearButton();
    grayOutYearButtons();
    updateYearIncDecButtons();

    setActiveListButton();
    grayOutListButtons();
});

/**
 * Update the page to display the correct data for the selected year and selected list
 */
function updateDisplay() {
    setActiveYearButton();
    setActiveListButton();

    // Hide all displays
    document.getElementById("search-results").classList.add("hidden");
    for (let i = OLDEST_YEAR; i <= NEWEST_YEAR; i++) {
        document.getElementById(`album-grid-${i}`).classList.add("hidden");
        if (i >= 2022) {
            document.getElementById(`song-table-${i}`).classList.add("hidden");
        }
    }

    // Handle search case, since it is unique
    if (currentList == "Search") {
        document.getElementById("search-results").classList.remove("hidden");
        document.getElementById("music-window-title").innerHTML = `Search Results`;
        document.getElementById("short-music-window-title").innerHTML = `Search Results`;
        window.dispatchEvent(new Event('resize'));
        grayOutYearButtons();
        grayOutListButtons();
        return;
    }

    // Update the title of the embedded window
    document.getElementById("music-window-title").innerHTML = `${currentYear} Favorite ${currentList}`;
    document.getElementById("short-music-window-title").innerHTML = `Favorite ${currentList}`;

    // Unhide the table/grid for the current year
    if (currentList == "Albums") {
        document.getElementById(`album-grid-${currentYear}`).classList.remove("hidden");
    }
    else if (currentList == "Songs") {
        document.getElementById(`song-table-${currentYear}`).classList.remove("hidden");
    }

    // Dispatch a 'resize' event so the base javascript will resize the scrollbar
    window.dispatchEvent(new Event('resize'));

    // Update the link to spotify playlist
    let playlistName = `${currentList} ${currentYear}`;
    document.getElementById("playlist-link").innerHTML = playlistName;
    document.getElementById("playlist-link").href = `${PLAYLIST_LINKS[playlistName]}`;

    grayOutYearButtons();
    grayOutListButtons();
}


/*-- ================================================ --->
<---                  YEAR SELECTOR                   --->
<--- ================================================ --*/
/**
 * Handle updating the grid and year selector buttons when a year button is clicked
 */
document.querySelectorAll(".year-button").forEach(btn => {
    btn.addEventListener("click", (e) => {
        currentYear = e.target.innerHTML;

        if (currentList == "Search") {
            currentList = "Albums"
        }
        
        updateDisplay();
    });
});

/**
 * Update which button (if any) has the active property
 */
function setActiveYearButton() {
    document.querySelectorAll(".year-button").forEach(btn => {
        if (btn.innerHTML != currentYear || currentList == "Search") {
            btn.classList.remove("active");
        }
        else {
            btn.classList.add("active");
        }
    })
}

/**
 * Disable/enable the year selector increase/decrease buttons, depending on which years are currently displayed
 */
function updateYearIncDecButtons() {
    let yearButtons = document.querySelectorAll(".year-button"); 
    document.getElementById("year-display-decrease").disabled = (yearButtons[0].innerHTML <= OLDEST_YEAR);
    document.getElementById("year-display-increase").disabled = (yearButtons[yearButtons.length - 1].innerHTML >= NEWEST_YEAR);
}

/**
 * Gray out the year buttons which do not have a playlist associated with them
 */
function grayOutYearButtons() {
    document.querySelectorAll(".year-button").forEach(btn => {
        let year = btn.innerHTML;
        let referenceList = (currentList == "Search") ? "Albums" : currentList;
        btn.disabled = (PLAYLIST_LINKS[`${referenceList} ${year}`] == null);
    });
}

/**
 * Changes which year numbers are displayed in the year selector
 * @param {*} sign 1 or -1, indicating which direction the year numbers should shift
 */
function changeListedYears(sign) {
    // Increment/Decrement all year numbers
    document.querySelectorAll(".year-button").forEach(btn => {
        btn.innerHTML = parseInt(btn.innerHTML) + sign*5;
    });

    // Update the view of the new buttons
    setActiveYearButton();
    grayOutYearButtons();
    updateYearIncDecButtons();
}
document.getElementById("year-display-increase").addEventListener("click", (e) => {
    changeListedYears(1);
});
document.getElementById("year-display-decrease").addEventListener("click", (e) => {
    changeListedYears(-1);
});


/*-- ================================================ --->
<---                  LIST SELECTOR                   --->
<--- ================================================ --*/
/**
 * Handle updating the displayed list and which years are valid when a list button is clicked
 */
document.getElementById("albums-button").addEventListener("click", (e) => {
    currentList = e.target.innerHTML;
    updateDisplay();
});
document.getElementById("songs-button").addEventListener("click", (e) => {
    currentList = e.target.innerHTML;
    updateDisplay();
});

/**
 * Update which button (if any) has the active property
 */
function setActiveListButton() {
    if (currentList == "Albums") {
        document.getElementById("albums-button").classList.add("active");
        document.getElementById("songs-button").classList.remove("active");
    }
    else if (currentList == "Songs") {
        document.getElementById("albums-button").classList.remove("active");
        document.getElementById("songs-button").classList.add("active");
    }
    else if (currentList == "Search") {
        document.getElementById("albums-button").classList.remove("active");
        document.getElementById("songs-button").classList.remove("active");
    }
}

/**
 * Gray out the list buttons which do not have a playlist associated with them
 */
function grayOutListButtons() {
    document.getElementById("albums-button").disabled = (PLAYLIST_LINKS[`Albums ${currentYear}`] == null);
    document.getElementById("songs-button").disabled = (PLAYLIST_LINKS[`Songs ${currentYear}`] == null);
}


/*-- ================================================ --->
<---                    SEARCHING                     --->
<--- ================================================ --*/
/**
 * Removes the extra labeling text the block content (i.e., "By: " and "Genre: ")
 * @param {*} block The text element to remove the text from.
 */
function normalizeBlockContent(element) {
    if (element.classList.contains("album-artist")) {
        return element.innerHTML.substring(14, element.innerHTML.length - 4).toLowerCase(); // Removes the "<b>By: </b><u>"
    }
    else if (element.classList.contains("album-genre")) {
        return element.innerHTML.substring(14).toLowerCase(); // Removes the "<b>Genre: </b>"
    }
    else {
        return element.innerHTML.toLowerCase();
    }
}

function highlightMatch(element, toMatch) {
    let regex = new RegExp(toMatch, 'gi');
    let highlightedText = element.innerHTML.replace(regex, (match) => `<span class="highlight">${match}</span>`);
    element.innerHTML = highlightedText;
}

function searchAllGrids(toSearch) {
    let blockMatches = [];

    document.querySelectorAll(".album-block").forEach(block => {
        let isMatch = false;
        let copyBlock = block.cloneNode(true);
        copyBlock.querySelector(".album-year").classList.remove("hidden");

        let selectors = [".album-name", ".album-artist", ".album-genre"]
        selectors.forEach(selector => {
            let text = normalizeBlockContent(block.querySelector(selector));
            if (text.includes(toSearch)) {
                highlightMatch(copyBlock.querySelector(selector), toSearch);
                isMatch = true;
            }
        });

        if (isMatch) {
            blockMatches.push(copyBlock);
        }
    });

    return blockMatches;
}

function searchAllTables(toSearch) {
    let rowMatches = [];

    document.querySelectorAll(".song-row").forEach(row => {
        let isMatch = false;
        let copyRow = row.cloneNode(true);
        copyRow.querySelector(".song-year").classList.remove("hidden");

        let selectors = [".song-name", ".song-artist", ".song-album", ".song-genre"]
        selectors.forEach(selector => {
            let text = row.querySelector(selector).innerHTML.toLowerCase();
            
            if (text.includes(toSearch)) {
                highlightMatch(copyRow.querySelector(selector), toSearch);
                isMatch = true;
            }
        });

        if (isMatch) {
            rowMatches.push(copyRow);
        }
    });

    return rowMatches;
}

function search(toSearch) {
    // Clear search area in preparation
    let searchGrid = document.getElementById("search-grid");
    let searchTable = document.getElementById("search-table");
    let searchTableBody = searchTable.querySelector("tbody");
    searchGrid.classList.add("hidden");
    searchTable.classList.add("hidden");
    searchGrid.textContent = "";
    searchTableBody.textContent = "";

    // Search all content
    toSearch = toSearch.toLowerCase();
    let blockMatches = searchAllGrids(toSearch);
    let songMatches = searchAllTables(toSearch);

    // Add all results to the search area
    if (blockMatches.length > 0) {
        searchGrid.classList.remove("hidden");
    }
    blockMatches.forEach(match => {
        searchGrid.appendChild(match);
    });

    if (songMatches.length > 0) {
        searchTable.classList.remove("hidden");
    }
    songMatches.forEach(match => {
        searchTableBody.appendChild(match);
    });

    // Update the display to only show the search area
    currentList = "Search";
    updateDisplay();
}

document.getElementById("searchbox").addEventListener("keyup", function(e) {
    if (e.key === "Enter") {
        search(this.value);
        this.value = "";
    }
});