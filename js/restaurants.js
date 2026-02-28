const map = L.map("map", {
        center:
            [29.46630060995385, 
            -98.50546763124163],
        zoom: 11,
        zoomControl: false,
        minZoom: 10,
        maxZoom: 18,
        inertia: false,
        maxBounds: [
            [28.884902,-99.1386173],
            [30.0487506,-97.9010104]
        ],
        zoomAnimation: false,
        markerZoomAnimation: false,
        fadeAnimation: false,
    });

const newIcon = L.icon({
    iconUrl: "images/restaurants/marker.png",
    iconSize: [24, 24],
    // iconAnchor: []
});

const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const PRECISION = 5; // Precision for how many decimals to include in lat/long url parsing

let restaurants = {}; // Will be list of dictionaries with keys {name, type, visited, notes, gps, googleUrl, originalUrl}
let markers = {} // Dictionary containing the map markers accessed by the restaurant name (e.g., {name : markerObj})
let manualSelections = []; // Stores which of the current restaurants were selected manually (not with a filter menu) 

let randomTimerId = null; // Stores the ID of the timer repeated highlighting/unhighlighting the randomly selected marker
let randomTimerMarker = null; // Stores the marker object the randomly selected marker
let randomOldZOffset = null; // Stores the old Z-Offset the randomly selected marker

let errorTimerId = null; // Stores the ID of the timer used for displaying an error
let errorStartTime = null; // Stores the time that the error is first displayed, used to determine when to stop displaying error

let debug = false; // Determines if API call with limits should be made


/*-- ================================================ --->
<---                   INITIALIZATION                 --->
<--- ================================================ --*/
//#region INITIALIZATION
/**
 * Creates and populates the map and table on load in
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeMap();
    loadCache();
    addListenerToFilters();
    initializeFilters();
    parseUrl();
    applyFilters(true);

    // Sort the table in ascending alphabetical order (by simulating a click on the table sort button)
    document.getElementById("sort-name-button").dispatchEvent(new Event("click"));

    // Update map tiles since some may not load by this point
    map.invalidateSize();
    map.setView([29.46630060995385, -98.50546763124163], 11);
});

/**
 * Normalizes the passed in restaurant name by removing all non-alphanumeric characters
 * @param {string} name The restaurant name to normalize
 * @returns String of the normalized alphanumeric name
 */
function normalizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

/**
 * Adds a tile layer to the map
 */
function initializeMap() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
}

/**
 * Adds CSS classes to the marker object corresponding to what color it should be (based off rating and visited)
 * @param {string} name The restaurant name
 * @param {string} visited Indication if the restaurant has been visited or not
 * @param {string} rating The restaurant rating, low/medium/high (indicates the priority if not visited)
 */
function applyMarkerColor(marker, visited, rating) {
    let colorClass = ""
    switch (rating) {
        case "high":
            colorClass = (visited) ? "visited-high" : "unvisited-high";
            break;
        case "medium":
            colorClass = (visited) ? "visited-medium" : "unvisited-medium";
            break;
        default:
            colorClass = (visited) ? "visited-low" : "unvisited-low";
            break;
    }
    marker._icon.classList.add(colorClass);
}

/**
 * Adds a new marker to the embedded map
 * @param {string} name The restaurant name
 * @param {string} lat The restaurant latitude
 * @param {string} long The restaurant longitude
 * @param {string} cuisine The restaurant cuisine type
 * @param {string} visited Indication if the restaurant has been visited or not
 * @param {string} rating The restaurant rating, low/medium/high (indicates the priority if not visited)
 * @param {string} notes Notes about the restaurant
 * @param {string} originalUrl Google Maps URL to the restaurant
 */
function addRestaurantMarker(name, lat, long, cuisine, visited, rating, notes, originalUrl) {
    markers[normalizeName(name)] = L.marker([lat, long], {icon: newIcon}).addTo(map)
        .bindPopup(`<b>${name}</b><br>
            ${cuisine}<br>
            <a href="${originalUrl}" target=_blank>View on Google</a><br>
            <i>${notes}</i>`);
    
    applyMarkerColor(markers[normalizeName(name)], visited, rating);
}

/**
 * Loads the list of restaurant information the HTML table into a local variable */
function loadCache() {
    // Load the restaurant data from HTML table into local cache
    let table = document.getElementById("restaurant-table-body");
    for (let row of table.rows) {
        let name = row.cells[tableColNameToIndex("Name")].textContent;
        let cuisine = row.cells[tableColNameToIndex("Cuisine")].textContent;
        let visited = row.cells[tableColNameToIndex("Visited")].textContent;
        let show = row.cells[tableColNameToIndex("Show")].children[0].checked;
        let rating = row.cells[tableColNameToIndex("Rating")].textContent;
        let notes = row.cells[tableColNameToIndex("Notes")].textContent;
        let gps = row.cells[tableColNameToIndex("Gps")].textContent;
        let originalUrl = row.cells[tableColNameToIndex("OriginalUrl")].textContent;

        restaurants[normalizeName(name)] = {
            "name": name,
            "cuisine" : cuisine,
            "visited" : visited,
            "show" : show,
            "rating" : rating,
            "notes" : notes,
            "gps" : gps,
            "originalUrl" : originalUrl,
        };

        // Add marker on the map
        addRestaurantMarker(name,
                gps.split(",")[0],
                gps.split(",")[1],
                cuisine,
                visited,
                rating,
                notes,
                originalUrl);
    }
}
//#endregion INITIALIZATION


/*-- ================================================ --->
<---                  APPLYING FILTERS                --->
<--- ================================================ --*/
//#region APPLYING_FILTERS
/**
 * Callback function to show/hide an individual restaurant marker assocaited with the passed in checkbox, depending on if it is checked or not
 * @param {checkbox} checkbox The HTML checkbox
 */
window.updateMarkerShown = function(checkbox) {
    let row = checkbox.closest("tr");
    let name = row.cells[tableColNameToIndex("Name")].innerText;
    let shouldBeShown = checkbox.checked;

    // Check the checkbox in the "Hide?" column to see if the marker should be shown
    if (shouldBeShown) {
        markers[normalizeName(name)]._icon.classList.remove("hidden");
    }
    else if (!markers[normalizeName(name)]._icon.classList.contains("hidden")) {
        markers[normalizeName(name)]._icon.classList.add("hidden");
    }
}

/**
 * Updates the markers of all restaurants to match the state of their table checkbox
 */
function updateAllMarkersShown() {
    // For each restaurant, see if the marker needs to be shown/hidden
    let table = document.getElementById("restaurant-table-body");
    for (let row of table.rows) {
        // Check the checkbox in the "Hide?" column to see if the marker should be shown
        let name = row.cells[tableColNameToIndex("Name")].innerText;
        let shouldBeShown = row.cells[tableColNameToIndex("Show")].children[0].checked;
        if (shouldBeShown) {
            markers[normalizeName(name)]._icon.classList.remove("hidden");
        }
        else if (!markers[normalizeName(name)]._icon.classList.contains("hidden")) {
            markers[normalizeName(name)]._icon.classList.add("hidden");
        }
    }
}

/**
 * Extract which menu options are selected for the passed in filter menu
 * @param {*} multiSelect The HTML filter menu whose children are the filters to extract
 * @returns A list of filters conditionals for this menu that need to be met for a marker to be shown
 */
function extractFilters(multiSelect) {
    let filters = [];

    let multiOptions = multiSelect.querySelectorAll(".multi-option");
    
    for (let option of multiOptions) {
        let selected = option.children[0].children[0].checked;
        if (selected) {
            filters.push(option.innerText.trim().toLowerCase());
        }
    }

    return filters;
}

/**
 * Determines if a restaurant passes the menu filters (visited, cuisine, rating)
 * @param {string} name The restaurant to check
 * @returns Boolean true/false
 */
function passesMenuFilters(name) {
    // Extract filter values from the HTML elements
    let visitedFilters = extractFilters(document.getElementById("visited-filter"));
    let cuisineFilters = extractFilters(document.getElementById("cuisine-filter"));
    let ratingFilters = extractFilters(document.getElementById("rating-filter"));

    // Get values of restaurant
    let visited = (restaurants[normalizeName(name)]["visited"] === "") ? "unvisited" : "visited";
    let cuisines = restaurants[normalizeName(name)]["cuisine"].split(" / ");
    let rating = restaurants[normalizeName(name)]["rating"];

    // Check if filter criteria are met
    let passVisitedFilter = (visitedFilters[0] === "any") || (visitedFilters.includes(visited));
    let passCuisineFilter = (cuisineFilters[0] === "any") || (cuisines.some(cuisine => cuisineFilters.includes(cuisine.toLowerCase())));
    let passRatingFilter = (ratingFilters[0] === "any") || (ratingFilters.includes(rating));

    return passVisitedFilter && passCuisineFilter && passRatingFilter;
}

/**
 * Apply all filters (isited, cuisine, rating, distance) and only show restaurants that pass
 */
function applyFilters(initialCall = false) {
    // Clear manual selections, since they will all be overwritten when filters are applied
    if (!initialCall) {
        manualSelections = [];
    }

    // Stop displaying a random selection, since the selection is changing
    if (!initialCall && randomTimerId) {
        stopHighlightTimer();
    }

    // Check if each restaurant passes the filters
    let table = document.getElementById("restaurant-table-body");
    for (let row of table.rows) {
        let name = row.cells[tableColNameToIndex("Name")].innerText;
        let shownCheckbox = row.cells[tableColNameToIndex("Show")].children[0];

        // Skip manually selected restaurants (only done on load in with URL parameters)
        if (initialCall && manualSelections.includes(name)) {
            continue;
        }

        // Show restaurant if it passes the filters, else hide it
        if (passesMenuFilters(name)) {
            shownCheckbox.checked = true;
        }
        else {
            shownCheckbox.checked = false;
        }
        updateMarkerShown(shownCheckbox);
    }

    // Resort the table if sorting for "shown"
    if (currentSortIndex == tableColNameToIndex("Show")) {
        sortTable(currentSortIndex, currentSortFunc);
    }
}
//#endregion APPLYING_FILTERS


/*-- ================================================ --->
<---                  FILTER CHECKBOXES               --->
<--- ================================================ --*/
//#region FILTER_CHECKBOXES
/**
 * Check every box in the filter menus, since all restaurants should be shown initially
 */
function initializeFilters() {
    let allCheckboxes = document.querySelectorAll(".multi-option input");
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });

    allCheckboxes[allCheckboxes.length - 4].checked = false;
    allCheckboxes[allCheckboxes.length - 3].checked = false;
    allCheckboxes[allCheckboxes.length - 2].checked = false;
}

/**
 * Update marker when clicking the checkbox associated with an individual restaurant (not a filter)
 * @param {*} checkbox The clicked on checkbox
 */
window.manuallySelectRestaurant = function(checkbox) {
    let row = checkbox.closest("tr");
    let name = row.cells[tableColNameToIndex("Name")].innerText;

    // If an option is already manually selected, then selecting it again "undoes" the manual selection, so remove it
    if (manualSelections.includes(normalizeName(name))) {
        let index = manualSelections.indexOf(normalizeName(name));
        manualSelections.splice(index, 1);
    }
    // Otherwise, add it to the manualSelections list
    else {
        manualSelections.push(normalizeName(name));
    }

    updateMarkerShown(checkbox);
}

/**
 * Sets all the checkboxes within the multi-select menu to the passed in value (true/false).
 * @param {*} multiOptionMenu The multi-select menu HTML element, containing all the multi-select options for this filter
 */
function setAllOptionBoxes(multiOptionMenu, value) {
    let allOptions = multiOptionMenu.querySelectorAll(".multi-option");
    allOptions.forEach(option => {
        let optionCheckbox = option.querySelectorAll("input")[0];
        optionCheckbox.checked = value;
    });
}

/**
 * Determine if all checkboxes within a given multi-select menu are checked (excluding the "any" checkbox)
 * @param {*} multiOptionMenu The multi-select menu HTML element, containing all the multi-select options for this filter
 * @returns Boolean of if all checkboxes are checked or not
 */
function allOptionsChecked(multiOptionMenu) {
    let allOptions = multiOptionMenu.querySelectorAll(".multi-option:not(.multi-any)");
    for (const option of allOptions) {
        let optionCheckbox = option.querySelectorAll("input")[0];
        if (!optionCheckbox.checked) {
            return false;
        }
    }

    return true;
}

/**
 * Handle when the "any" option is selected in a multi-menu
 * When the "any" option is selected, automatically check all the checkboxes in its associated filter menu
 * If the "any" option is unselected but all boxes are still checked, "undo" by unchecking all the boxes
 */
let anyCheckboxes = document.querySelectorAll(".multi-any input");
anyCheckboxes.forEach(anyCheckbox => anyCheckbox.addEventListener("click", function() {
    let multiOptionMenu = anyCheckbox.closest(".multi-select");
    if (anyCheckbox.checked) {
        setAllOptionBoxes(multiOptionMenu, true);
    }
    else if (allOptionsChecked(multiOptionMenu)) {
        setAllOptionBoxes(multiOptionMenu, false);
    }

    applyFilters()
    updateAllMarkersShown();
}));

/**
 * Handle when a regular filter option checkbox is clicked, including:
 *      - Handle how to update the "any" checkbox when an option is selected
 *          If the "any" checkbox is checked, and an option is unselected ==> unchecked "any"
 *          If the "any" checkbox is unchecked, and all options are selected ==> check "any"
 *      - Immediately apply the new filtering rules and update markers
 */
function addListenerToFilters() {
    let allOptionCheckboxes = document.querySelectorAll(".multi-option:not(.multi-any) input");

    allOptionCheckboxes.forEach(optionCheckbox => optionCheckbox.addEventListener("click", function() {
        let multiOptionMenu = optionCheckbox.parentElement.parentElement.parentElement; // <div><label><input></label></div>
        let anyCheckbox = multiOptionMenu.querySelector(".multi-any input");
        if (!optionCheckbox.checked && anyCheckbox.checked) {
            anyCheckbox.checked = false;
        }
        else if (allOptionsChecked(multiOptionMenu)) {
            anyCheckbox.checked = true;
        }

        applyFilters()
        updateAllMarkersShown();
    }));
}
//#endregion FILTER_CHECKBOXES


/*-- ================================================ --->
<---               URL SHARING & ENCODING             --->
<--- ================================================ --*/
//#region URL_SHARING
/**
 * Encode a bit string as base62
 * @param {string} bitString 
 * @returns String of base62 encoding
 */
function bitStringToBase62(bitString) {
    // Encode into integer
    let n = BigInt("0b" + bitString);
    if (n === 0n) {
        return BASE62[0];
    }

    // Encode n in base62
    let encoding = "";
    while (n > 0) {
        let r = n % 62n;
        encoding = BASE62[Number(r)] + encoding;
        n /= 62n;
    }

    return encoding;
}

/**
 * Converts the current state of all filters into a bit string
 * @returns A bit string representing the filter states
 */
function encodeFilters() {
    // Build bit string of all menu filters, where filter on = "1", filter off = "0"
    let bitString = "";
    let filterCheckboxes = document.querySelectorAll(".multi-option input");
    filterCheckboxes.forEach(filterCheckbox => {
        bitString += (filterCheckbox.checked) ? "1" : "0";
    });

    return bitString;
}

/**
 * Converts the current manually selected restaurants into a bit string
 * @returns A bit string representing the manually selected restaurants
 */
function encodeManualSelections() {
    let bitString = "";

    // Append bit string representing the key indices of the manual selections
    let selectionBitLen = parseInt(Object.keys(restaurants).length).toString(2).length;
    for (let name of manualSelections) {
        let index = Object.keys(restaurants).indexOf(name).toString(2);
        bitString += "0".repeat(Math.abs(selectionBitLen - index.length)) + index;
    }
    
    return bitString;
}

/**
 * Converts the current random restaurant into a bit string
 * @returns A bit string representing the random restaurant
 */
function encodeRandom() {
    let bitString = "";

    // Append bit string representing the key indices of the manual selections
    let bitLen = parseInt(Object.keys(restaurants).length).toString(2).length;

    let randomSelection = document.getElementById("random-selection").value;
    if (randomSelection) {
        let index = Object.keys(restaurants).indexOf(normalizeName(randomSelection)).toString(2);
        bitString += "0".repeat(Math.abs(bitLen - index.length)) + index;
    }
    
    return bitString;
}

/**
 * Listener to handle when the button to create the sharable URL is clicked - will update the URL and copy sharable URL to clipboard
 */
document.getElementById("share-button").addEventListener("click", async function() {
    let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

    // Get bit strings representing the state
    let filtersBitString = encodeFilters();
    let manualSelectionsBitString = encodeManualSelections();
    let randomBitString = encodeRandom();

    // Encode the map state as base62 and add to URL
    if (filtersBitString) {
        let encodedFilters = bitStringToBase62("1" + filtersBitString);
        let prefix = newUrl.includes("?") ? "&" : "?";
        newUrl += prefix + "f=" + encodedFilters;
    }
    if (manualSelectionsBitString) {
        let encodedManualSelections = bitStringToBase62("1" + manualSelectionsBitString);
        let prefix = newUrl.includes("?") ? "&" : "?";
        newUrl += prefix + "m=" + encodedManualSelections;
    }
    if (randomBitString) {
        let encodedRandom = bitStringToBase62("1" + randomBitString);
        let prefix = newUrl.includes("?") ? "&" : "?";
        newUrl += prefix + "r=" + encodedRandom;
    }
    
    // Set the encoding as the new URL and copy to clipboard
    window.history.pushState({ path: newUrl }, '', newUrl);
    await navigator.clipboard.writeText(newUrl);
    // alert("Sharable URL copied to clipboard!");
    let subheader = document.getElementById("share-subheader");
    subheader.innerText = "link copied to clipboard!";
    setTimeout(() => {
        subheader.innerHTML = "&nbsp;";
    }, 15000);
    
});

/**
 * Convert a base62 encoded string into a bit string
 * @param {string} encoding The base62 string to convert
 * @returns A bit string
 */
function base62ToBitString(encoding) {
    // Decode from base62 into integer
    let n = 0n;
    for (let char of encoding) {
        n = n * 62n + BigInt(BASE62.indexOf(char));
    }

    // Convert integer into bit string
    return n.toString(2);
}

/**
 * Set which filters are on/off, based on the state info within the bit string
 * @param {string} bitString The bit string containing the state of each filter
 */
function decodeAndSetFilters(bitString) {
    // Each bit represents a filter on/off
    let filterCheckboxes = document.querySelectorAll(".multi-option input");
    for (let i = 0; i < filterCheckboxes.length; i++) {
        let filterCheckbox = filterCheckboxes[i];
        filterCheckbox.checked = (bitString[i] == "1") ? true : false;
    }

    applyFilters();
}

/**
 * Set which restaurants should be manually set shown/hidden, based on the info within the bit string
 * @param {string} bitString The bit string containing the manually selected restaurants
 */
function decodeAndSetManualSelections(bitString) {
    let selectionBitLen = parseInt(Object.keys(restaurants).length).toString(2).length;

    let i = 0;
    while (i < bitString.length) {
        let chunk = bitString.slice(i, i + selectionBitLen);
        let keyIndex = parseInt(chunk, 2);
        let name = Object.keys(restaurants)[keyIndex];

        manualSelections.push(name);

        // Flip the shown/hidden for the manually selected restaurant
        let table = document.getElementById("restaurant-table-body");
        for (let row of table.rows) {
            if (name == normalizeName(row.cells[tableColNameToIndex("Name")].innerText)) {
                let checkbox = row.cells[tableColNameToIndex("Show")].children[0];
                checkbox.checked = !checkbox.checked;
                updateMarkerShown(checkbox);
                break;
            }
        }

        i += selectionBitLen;
    }
}

/**
 * Set which restaurant should be highlighted as the random selection, based on the info within the bit string
 * @param {string} bitString The bit string containing the random restaurant
 */
function decodeAndSetRandom(bitString) {
    let keyIndex = parseInt(bitString, 2);
    let normalizedName = Object.keys(restaurants)[keyIndex];

    document.getElementById("random-selection").value = restaurants[normalizedName]["name"];
    document.getElementById("random-cuisine").value = restaurants[normalizedName]["cuisine"];

    startHighlightTimer(restaurants[normalizedName]["name"]);
}

/**
 * Parses the current URL and updates the map/table state to match the information in the URL
 */
function parseUrl() {
    let urlParams = new URLSearchParams(window.location.search);

    // Extract bit strings from base62 URL parameter
    let encodedFilters = urlParams.get("f");
    let encodedManualSelections = urlParams.get("m");
    let encodedRandom = urlParams.get("r");

    // If no parameters, nothing to do
    if (!(encodedFilters || encodedManualSelections || encodedRandom)) {
        return;
    }

    // Apply all passed in state information
    if (encodedFilters) {
        let filtersBitString = base62ToBitString(encodedFilters).slice(1);
        decodeAndSetFilters(filtersBitString);
    }
    if (encodedManualSelections) {
        let manualSelectionsBitString = base62ToBitString(encodedManualSelections).slice(1);
        decodeAndSetManualSelections(manualSelectionsBitString);
    }
    if (encodedRandom) {
        let randomBitString = base62ToBitString(encodedRandom).slice(1);
        decodeAndSetRandom(randomBitString);
    }
}
//#endregion URL_SHARING


/*-- ================================================ --->
<---                  RANDOM SELECTION                --->
<--- ================================================ --*/
//#region RANDOM_SELECTION
/**
 * Starts the highlight/unhighlight timer for the given restaurant name
 */
function startHighlightTimer(randName) {
    // Bring the marker to the front
    let marker = markers[normalizeName(randName)];
    randomOldZOffset = marker.options.zIndexOffset;
    marker.options.zIndexOffset = 1000;
    marker.setLatLng(marker.getLatLng()); // redraws the marker
    
    // Save values needed to stop the timer, then start the timer
    randomTimerMarker = marker;
    marker._icon.classList.add("highlight");
    randomTimerId = setInterval(() => {
        randomTimerMarker._icon.classList.toggle("highlight");
    }, 750);

    // Enable the stop button
    let button = document.getElementById("clear-random-button");
    button.disabled = false;
}

/**
 * Stop the highlight/unhighlight timer and reset the marker to its original state
 */
function stopHighlightTimer() {
    clearInterval(randomTimerId);
    
    if (randomTimerMarker._icon.classList.contains("highlight")) {
        randomTimerMarker._icon.classList.remove("highlight");
    }
    randomTimerMarker.options.zIndexOffset = randomOldZOffset;
    randomTimerMarker.setLatLng(randomTimerMarker.getLatLng());
    
    randomTimerId = null;
    randomTimerMarker = null;
    randomOldZOffset = null;
}

/**
 * Listener to handle when the button to choose a random selected restaurant is pressed
 */
document.getElementById("random-button").addEventListener("click", function() {
    // If a restaurant is already randomly selected, stop its timer and reset its values
    if (randomTimerId) {
        stopHighlightTimer();
    }
    
    // Build list of all restaurants currently selected (AKA passing all filters)
    let selections = {};
    let table = document.getElementById("restaurant-table-body");
    for (let row of table.rows) {
        // Check the checkbox in the "Hide?" column to see if the restaurant is selected
        let name = row.cells[tableColNameToIndex("Name")].innerText;
        let cuisine = row.cells[tableColNameToIndex("Cuisine")].innerText;
        let isSelected = row.cells[tableColNameToIndex("Show")].children[0].checked;
        if (isSelected) {
            selections[name] = cuisine;
        }
    }

    // Select and display the random selected restaurant
    let rand = Math.floor(Math.random() * Object.values(selections).length);
    let randName = Object.keys(selections)[rand];
    let randCuisine = Object.values(selections)[rand]
    document.getElementById("random-selection").value = randName;
    document.getElementById("random-cuisine").value = randCuisine;

    // Add timer to alternate between original marker color and highlight
    startHighlightTimer(randName);
});
document.getElementById("clear-random-button").addEventListener("click", function() {
    if (randomTimerId) {
        stopHighlightTimer();
    }

    document.getElementById("random-selection").value = "";
    document.getElementById("random-cuisine").value = "";
    
    this.disabled = true;
});
//#endregion RANDOM_SELECTION


/*-- ================================================ --->
<---                   SORTING TABLE                  --->
<--- ================================================ --*/
//#region SORTING_TABLE
/**
 * Updates the classes for each table sorting button, depending on which button is "active"
 */
function updateActiveSortButton(activeButton) {
    let sortingButtons = document.querySelectorAll(".table-sort-button");
    for (let button of sortingButtons) {
        if (button == activeButton) {
            button.classList.remove("inactive-button");
        }
        else {
            button.classList.add("inactive-button");
            button.classList.remove("up-button");
            button.classList.add("down-button");
        }
    }
}

/**
 * Converts the a table column header string into the integer index of that column
 * @param {*} colName the table column header string
 * @returns index value of that column
 */
function tableColNameToIndex(colName) {
    let tableHeader = document.getElementById("restaurant-table-header");
    let index = 0;

    for (let child of tableHeader.rows[0].children) {
        if (normalizeName(child.innerText) == normalizeName(colName)) {
            return index;
        }
        index++;
    }

    return -1;
}

/**
 * Sorting functions used to sort the table
 */
function alphaSort(a, b) { return (normalizeName(a.innerHTML) > normalizeName(b.innerHTML)); };
function visitSort(a, b) { return (!a.innerHTML && b.innerHTML); };
function checkboxSort(a, b) { return (!a.children[0].checked && b.children[0].checked); };

/**
 * Listeners to apply the correct sorting function to the table
 */
document.getElementById("sort-name-button").addEventListener("click", function() {
    this.classList.toggle("up-button");
    this.classList.toggle("down-button");
    
    // Sort the table to match button
    let reverse = !this.classList.contains("up-button");
    sortTable(tableColNameToIndex("Name"), alphaSort, reverse);

    // Update all sorting buttons for the table
    updateActiveSortButton(this);
});
document.getElementById("sort-cuisine-button").addEventListener("click", function() {
    this.classList.toggle("up-button");
    this.classList.toggle("down-button");
    
    // Sort the table to match button
    let reverse = !this.classList.contains("up-button");
    sortTable(tableColNameToIndex("Cuisine"), alphaSort, reverse);

    // Update all sorting buttons for the table
    updateActiveSortButton(this);
});
document.getElementById("sort-visited-button").addEventListener("click", function() {
    this.classList.toggle("up-button");
    this.classList.toggle("down-button");
    
    // First sort alphabetically by name, then sort by visited or not
    let reverse = !this.classList.contains("up-button");
    sortTable(tableColNameToIndex("Name"), alphaSort, reverse);
    sortTable(tableColNameToIndex("Visited?"), visitSort, reverse);

    // Update all sorting buttons for the table
    updateActiveSortButton(this);
});
document.getElementById("sort-shown-button").addEventListener("click", function() {
    this.classList.toggle("up-button");
    this.classList.toggle("down-button");

    // First sort alphabetically by name, then sort by shown or not
    let reverse = !this.classList.contains("up-button");
    sortTable(tableColNameToIndex("Name"), alphaSort, reverse);
    sortTable(tableColNameToIndex("Show"), checkboxSort, reverse);

    // Update all sorting buttons for the table
    updateActiveSortButton(this);
});

/**
 * Store the last used sorting values so the sorting can be automatically reapplied when applying new filters
 */
let currentSortIndex ;
let currentSortFunc;

/**
 * Sort the restaurant table according to the sorting function
 * @param {*} sortIndex the index of the column to sort
 * @param {*} sortFunc the comparison function between two elements to use when sorting
 * @param {*} reverse boolean of if the result should be in reverse order or not
 */
function sortTable(sortIndex, sortFunc, reverse = false) {
    currentSortIndex = sortIndex;
    currentSortFunc = sortFunc;

    let table = document.getElementById("restaurant-table-body");
    let rows = Array.from(table.rows);

    for (let i = 1; i < table.rows.length; i++) {
        let keyRow = rows[i];
        let keyValue = keyRow.cells[sortIndex];

        let j = i - 1;
        while (j >= 0 && sortFunc(rows[j].cells[sortIndex], keyValue)) {
            rows[j + 1] = rows[j]
            j--;
        }

        rows[j + 1] = keyRow;
    }
    
    if (reverse) {
        rows = rows.reverse();
    }

    rows.forEach(row => table.appendChild(row));
}
//#endregion SORTING_TABLE