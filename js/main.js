import { OSM_API_KEY } from "./config.js";
import { ORS_API_KEY } from "./config.js";

const SAT_TX_COORDS = [29.4246, -98.49514];

const map = L.map("map", {
    center: SAT_TX_COORDS,
    zoom: 11,
    zoomControl: true,
});

const newIcon = L.icon({
    iconUrl: "images/marker.png",
    iconSize: [24, 24],
    // iconAnchor: []
});

// Will be list of dictionaries with keys {name, type, visited, notes, gps, googleUrl, originalUrl}
let restaurants = {};

// Dictionary containing the map markers accessed by the restaurant name (e.g., {name : markerObj})
let markers = {}

// Store if the user is currently placing an isochrone on their next map click
let placingIsochrone = false;

// Store the isochrone object
let isochroneFilter = null;

let debug = true;

// Example isochrone for testing
let mockIsochrone = {
    "type": "FeatureCollection",
    "bbox": [
        -98.59893,
        29.337621,
        -98.404024,
        29.51359
    ],
    "features": [
        {
            "type": "Feature",
            "properties": {
                "group_index": 0,
                "value": 600,
                "center": [
                    -98.49467927986943,
                    29.419044378190836
                ]
            },
            "geometry": {
                "coordinates": [
                    [
                        [-98.554135, 29.511467], [-98.553356, 29.508601], [-98.553144, 29.50792], [-98.552925, 29.507378], [-98.552969, 29.498811], [-98.553284, 29.498165], [-98.549085, 29.492064], [-98.548258, 29.489829], [-98.548055, 29.489372], [-98.546728, 29.487891], [-98.546115, 29.487065], [-98.545252, 29.486082], [-98.544414, 29.485375], [-98.543391, 29.48466], [-98.542395, 29.484109], [-98.5431, 29.475228], [-98.54473, 29.47514], [-98.545043, 29.474854], [-98.548958, 29.467647], [-98.550723, 29.466565], [-98.551093, 29.465733], [-98.551614, 29.463582], [-98.552795, 29.455863], [-98.553398, 29.454102], [-98.553732, 29.450517], [-98.553905, 29.447785], [-98.553833, 29.446917], [-98.554773, 29.438784], [-98.555781, 29.435366], [-98.556925, 29.4312], [-98.556936, 29.431094], [-98.560461, 29.422919], [-98.56405, 29.422064], [-98.565222, 29.422166], [-98.565954, 29.420809], [-98.571264, 29.415209], [-98.574271, 29.413758], [-98.576193, 29.411157], [-98.580199, 29.409209], [-98.581779, 29.409189], [-98.587268, 29.415029], [-98.587707, 29.416589], [-98.587914, 29.417549], [-98.588149, 29.418311], [-98.59159, 29.417253], [-98.591356, 29.416491], [-98.597163, 29.409616], [-98.59893, 29.409305], [-98.598703, 29.405713], [-98.595437, 29.40592], [-98.593151, 29.406027], [-98.592047, 29.406062], [-98.590302, 29.406089], [-98.588035, 29.405961], [-98.586382, 29.405894], [-98.583549, 29.405616], [-98.576967, 29.400424], [-98.575478, 29.39996], [-98.575455, 29.399958], [-98.573566, 29.401603], [-98.567633, 29.403887], [-98.564487, 29.398099], [-98.564586, 29.397242], [-98.564246, 29.395363], [-98.563867, 29.386682], [-98.565171, 29.385085], [-98.56518, 29.38493], [-98.564197, 29.383097], [-98.563129, 29.381555], [-98.562518, 29.380823], [-98.562185, 29.380431], [-98.56115, 29.379869], [-98.553301, 29.379035], [-98.550015, 29.377605], [-98.545606, 29.371962], [-98.549262, 29.3682], [-98.550932, 29.367407], [-98.553098, 29.36498], [-98.552127, 29.361974], [-98.54831, 29.357938], [-98.548483, 29.350268], [-98.554606, 29.34438], [-98.555144, 29.344198], [-98.555418, 29.344085], [-98.557166, 29.343387], [-98.557568, 29.343213], [-98.560907, 29.341622], [-98.562551, 29.34096], [-98.561205, 29.337621], [-98.559561, 29.338284], [-98.556563, 29.339522], [-98.555348, 29.340025],
                        [-98.553622, 29.340709], [-98.551871, 29.341404], [-98.550894, 29.341812], [-98.550535, 29.341981], [-98.548402, 29.34285], [-98.546721, 29.343542], [-98.543791, 29.344744], [-98.535942, 29.342229], [-98.534398, 29.340894], [-98.534135, 29.340895], [-98.532342, 29.342243], [-98.531205, 29.343823], [-98.530117, 29.345452], [-98.530121, 29.345642], [-98.530121, 29.345656], [-98.530124, 29.345846], [-98.53011, 29.346971], [-98.528247, 29.351264], [-98.521489, 29.352642], [-98.52034, 29.352107], [-98.519886, 29.352106], [-98.516507, 29.352313], [-98.516328, 29.352306], [-98.514459, 29.353751], [-98.512132, 29.354882], [-98.50388, 29.353299], [-98.503863, 29.353299], [-98.496509, 29.354979], [-98.490307, 29.350472],
                        [-98.48904, 29.34987], [-98.488117, 29.349519], [-98.488104, 29.349524], [-98.487008, 29.351912], [-98.480731, 29.355723], [-98.480455, 29.355814], [-98.479495, 29.357261], [-98.479367, 29.358361], [-98.47689, 29.365202], [-98.469727, 29.363146], [-98.468429, 29.360599], [-98.467298, 29.358279], [-98.465088, 29.353704], [-98.464812, 29.353148], [-98.462839, 29.352822], [-98.462723, 29.352865], [-98.461588, 29.35475], [-98.461865, 29.355307], [-98.456924, 29.362238], [-98.452329, 29.356805], [-98.452348, 29.35641], [-98.45238, 29.355728], [-98.452384, 29.355641], [-98.451281, 29.352691], [-98.449795, 29.35098], [-98.449265, 29.350906], [-98.448182, 29.350823], [-98.447827, 29.350822], [-98.447206, 29.350862], [-98.447055, 29.351056],
                        [-98.446377, 29.352215], [-98.445089, 29.354731], [-98.441431, 29.357603], [-98.434608, 29.351935], [-98.434608, 29.351933], [-98.432714, 29.350068], [-98.426103, 29.345879], [-98.425069, 29.344246], [-98.424375, 29.34306], [-98.423564, 29.341504], [-98.423134, 29.340528], [-98.422756, 29.33961], [-98.419427, 29.34098], [-98.419804, 29.341898], [-98.420268, 29.342954], [-98.42118, 29.344718], [-98.421959, 29.346058], [-98.425724, 29.353757], [-98.425734, 29.353774], [-98.426297, 29.354678], [-98.426541, 29.355024], [-98.426755, 29.355281], [-98.429715, 29.358217], [-98.434045, 29.364787], [-98.43567, 29.366377], [-98.439701, 29.369583], [-98.437798, 29.375894], [-98.437102, 29.377898], [-98.437171, 29.378162], [-98.437197, 29.378252],
                        [-98.43728, 29.378513], [-98.437753, 29.379494], [-98.438509, 29.386465], [-98.432883, 29.392793], [-98.431317, 29.394218], [-98.429808, 29.396287], [-98.428256, 29.398198], [-98.428259, 29.398241], [-98.430931, 29.403695], [-98.429045, 29.407673], [-98.428376, 29.408663], [-98.424337, 29.411654], [-98.422586, 29.41345], [-98.422586, 29.41346], [-98.420915, 29.421913], [-98.419353, 29.42416], [-98.421841, 29.426762], [-98.422226, 29.426394], [-98.42338, 29.425178], [-98.423951, 29.424427], [-98.43266, 29.426273], [-98.432691, 29.42681], [-98.433934, 29.428688], [-98.434402, 29.436528], [-98.433261, 29.438533], [-98.428637, 29.444413],
                        [-98.427653, 29.445063], [-98.426736, 29.445685], [-98.42586, 29.446184], [-98.42368, 29.44726], [-98.419945, 29.44902], [-98.418764, 29.449643], [-98.41741, 29.450244], [-98.408892, 29.450002], [-98.408366, 29.449917], [-98.405401, 29.45196], [-98.405684, 29.452371], [-98.406132, 29.452912], [-98.406496, 29.453283], [-98.408733, 29.459235], [-98.407565, 29.462451], [-98.406834, 29.46431], [-98.405919, 29.465867], [-98.40494, 29.468452], [-98.404024, 29.470274], [-98.40724, 29.471891], [-98.408156, 29.47007], [-98.409072, 29.468249], [-98.412581, 29.462797],
                        [-98.412633, 29.462693], [-98.412633, 29.462693], [-98.412668, 29.462624], [-98.413785, 29.458871], [-98.421579, 29.454741], [-98.422034, 29.454525], [-98.422766, 29.454173], [-98.428087, 29.451436], [-98.431483, 29.448336], [-98.432728, 29.447418], [-98.435131, 29.445581], [-98.437177, 29.444387], [-98.437329, 29.444308], [-98.439613, 29.442992], [-98.4474, 29.44409], [-98.450539, 29.444933], [-98.450718, 29.444933], [-98.452084, 29.444931], [-98.452995, 29.44493], [-98.453125, 29.44493], [-98.45685, 29.444616], [-98.46096, 29.443172], [-98.461738, 29.443168], [-98.463325, 29.44317], [-98.463724, 29.44317], [-98.46446, 29.443165], [-98.469544, 29.448137],
                        [-98.466992, 29.452081], [-98.464973, 29.452912], [-98.459142, 29.455314], [-98.457682, 29.455739], [-98.456211, 29.456149], [-98.454289, 29.456341], [-98.454221, 29.456627], [-98.454219, 29.456634], [-98.453924, 29.45786], [-98.45909, 29.464605], [-98.460905, 29.465883], [-98.462927, 29.466996], [-98.463923, 29.467549], [-98.464397, 29.467552], [-98.473028, 29.469432], [-98.473371, 29.469927], [-98.474122, 29.470818], [-98.475545, 29.472528], [-98.479456, 29.479572], [-98.480114, 29.483124], [-98.480515, 29.485338], [-98.480867, 29.489503], [-98.480921, 29.490161], [-98.481058, 29.490942], [-98.482339, 29.49545], [-98.485882, 29.494814], [-98.485802, 29.494365], [-98.485474, 29.492562], [-98.485177, 29.491055], [-98.485148, 29.490762], [-98.484483, 29.487946], [-98.484475, 29.487444], [-98.484468, 29.48734], [-98.484057, 29.484695], [-98.491688, 29.480307], [-98.491747, 29.480307], [-98.499187, 29.482148], [-98.503529, 29.48603], [-98.504313, 29.487492], [-98.505579, 29.489092], [-98.506286, 29.489933], [-98.506436, 29.489968], [-98.508636, 29.490481], [-98.508729, 29.490481], [-98.512663, 29.490374], [-98.513505, 29.49038], [-98.521003, 29.494678], [-98.523476, 29.500759], [-98.524156, 29.501553], [-98.525754, 29.502568], [-98.525981, 29.502565], [-98.527756, 29.50156],
                        [-98.535149, 29.497431], [-98.536821, 29.495792], [-98.543822, 29.496437], [-98.544569, 29.50347], [-98.54984, 29.509374], [-98.550675, 29.512461], [-98.550999, 29.51359], [-98.55446, 29.512597], [-98.554135, 29.511467]
                    ]
                ],
                "type": "Polygon"
            }
        }
    ],
    "metadata": {
        "attribution": "openrouteservice.org | OpenStreetMap contributors",
        "service": "isochrones",
        "timestamp": 1765660199946,
        "query": {
            "profile": "driving-car",
            "profileName": "driving-car",
            "locations": [
                [
                    -98.49468469619751,
                    29.419040184688168
                ]
            ],
            "range": [
                600
            ],
            "range_type": "time"
        },
        "engine": {
            "version": "9.5.0",
            "build_date": "2025-10-31T12:33:09Z",
            "graph_date": "2025-12-07T11:20:28Z",
            "osm_date": "2025-12-01T01:00:00Z"
        }
    }
}

/********************************
**** STARTUP / ON LOADING IN ****
********************************/
/**
 * Creates and populates the map and table on load in
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeMap();
    loadCacheAndState(); // async
});

/**
 * Adds a tile layer to the map
 */
function initializeMap() {
    if (debug) {
        // Add free tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        }).addTo(map);
    }
    else {
        // Add rate limited tile layer (OpenStreetMap)
        L.tileLayer("https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=" + OSM_API_KEY, {
            attribution: "© MapTiler © OpenStreetMap contributors"
        }).addTo(map);
    }
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
 * @param {string} googleUrl Google Maps URL to the restaurant
 */
function addRestaurantMarker(name, lat, long, cuisine, visited, rating, notes, googleUrl) {
    markers[normalizeName(name)] = L.marker([lat, long], {icon: newIcon}).addTo(map)
        .bindPopup(`<b>${name}</b><br>
            ${cuisine}<br>
            <a href="${googleUrl}" target=_blank>View on Google</a><br>
            <i>${notes}</i>`);
    
    applyMarkerColor(markers[normalizeName(name)], visited, rating);
}

/**
 * Adds a new row to the HTML restaurant list table
 * @param {string} name The restaurant name
 * @param {string} cuisine The restaurant cuisine type
 * @param {string} visited Indication if the restaurant has been visited or not
 */
function addRow(name, cuisine, visited) {
    let table = document.getElementById("sidebar-table-body");
    let newRow = table.insertRow(-1);
    newRow.insertCell().innerHTML = name;
    newRow.insertCell().innerHTML = cuisine;
    newRow.insertCell().innerHTML = visited;
    newRow.insertCell().innerHTML = "<input type=\"checkbox\" onclick=\"updateMarkerShown(this)\" checked>";
}

/**
 * Loads the list of restaurant information in locations.csv into the local cache and updates table/map HTML contents with that info
 */
function loadCacheAndState() {
    let cuisineFilters = [];

    // Read all restaurants from CSV, then insert into map/table
    let filename = "csv/locations.csv";
    d3.csv(filename).then(async function(data) {
        data.forEach(row => {
            // Add data to local cache        
            restaurants[normalizeName(row["name"])] = row;

            // Update map/table
            addRestaurantMarker(row["name"],
                row["gps"].split(",")[0],
                row["gps"].split(",")[1],
                row["cuisine"],
                row["visited"],
                row["rating"],
                row["notes"],
                row["googleUrl"]);
            addRow(row["name"], row["cuisine"], row["visited"])

            // Update cuisine type filters
            let cuisines = row["cuisine"].split(" / ");
            for (let cuisine of cuisines) {
                if (!cuisineFilters.includes(cuisine)) {
                    cuisineFilters.push(cuisine);
                }
            }
        })

        // Sort cuisines in alphabetical order
        cuisineFilters.sort();

        // Create HTML element for each cuisine type
        let cuisineFilterMenu = document.getElementById("cuisine-filter");
        for (let cuisine of cuisineFilters) {
            let filterHtml = document.createElement("div");
            filterHtml.classList.add("multi-option");
            filterHtml.innerHTML = `<input type="checkbox"> ${cuisine}`;
            cuisineFilterMenu.appendChild(filterHtml);
        }
        addListenerToFilters();

        // Set filters (all true, or to the URL parameters if they exists), then update website
        initializeFilters();
        parseUrl();
        applyFilters();
    });
}


/*************************
**** APLLYING FILTERS ****
*************************/
/**
 * Callback function to show/hide an individual restaurant marker assocaited with the passed in checkbox, depending on if it is checked or not
 * @param {checkbox} checkbox The HTML checkbox
 */
window.updateMarkerShown = function(checkbox) {
    let row = checkbox.closest("tr");
    let name = row.cells[0].innerText;
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
    let table = document.getElementById("sidebar-table-body");
    for (let row of table.rows) {
        // Check the checkbox in the "Hide?" column to see if the marker should be shown
        let name = row.cells[0].innerText;
        let shouldBeShown = row.cells[row.cells.length - 1].children[0].checked;
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
        let selected = option.children[0].checked;
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
function applyFilters() {
    let table = document.getElementById("sidebar-table-body");
    for (let row of table.rows) {
        let name = row.cells[0].innerText;
        let shownCheckbox = row.cells[row.cells.length - 1].children[0];
        if (passesMenuFilters(name) && passesIsochroneFilter(name)) {
            shownCheckbox.checked = true;
        }
        else {
            shownCheckbox.checked = false;
        }
        updateMarkerShown(shownCheckbox);
    }
}


/************************************
**** QOL FILTERING FUNCTIONALITY ****
************************************/
/**
 * Check every box in the filter menus, since all restaurants should be shown initially
 */
function initializeFilters() {
    let allCheckboxes = document.querySelectorAll(".multi-option input");
    allCheckboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

/**
 * Open/close the filter dropdown menu when the filter button is clicked
 */
document.getElementById("filter-dropdown-button").addEventListener("click", function() {
    // Change arrow direction of button
    let button = document.getElementById("filter-dropdown-button");
    button.innerHTML = (button.innerHTML === "▼") ? "▲" : "▼";
    // Open/Close the dropdown menu
    let filterDropdown = document.getElementById("filter-dropdown");
    filterDropdown.style.display = (filterDropdown.style.display === "none") ? "block" : "none";
});

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
        let multiOptionMenu = optionCheckbox.parentElement.parentElement;
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


/**********************************
**** URL SHARING FUNCTIONALITY ****
**********************************/
/**
 * Normalizes the passed in restaurant name by removing all non-alphanumeric characters
 * @param {string} name The restaurant name to normalize
 * @returns String of the normalized alphanumeric name
 */
function normalizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Enumerates the names all shown restuarants into a single string
 * @returns String of all the normalized restaurant names currently being shown, delimited by ':'
 */
function enumerateShownRestaurants() {
    let enumeration = "";

    let table = document.getElementById("sidebar-table-body");
    for (let row of table.rows) {
        // Check the checkbox in the "Hide?" column to see if the marker should be shown
        let name = row.cells[0].innerText;
        let shown = row.cells[row.cells.length - 1].children[0].checked;
        if (shown) {
            enumeration += (enumeration.length == 0) ? "" : ":";
            enumeration += normalizeName(name);
        }
    }

    return enumeration;
}

/**
 * Listener to handle when the button to create the sharable URL is clicked - will update the URL and copy sharable URL to clipboard
 */
document.getElementById("export-button").addEventListener("click", async function() {
    let selections = enumerateShownRestaurants();
    let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + 
                 "?selections=" + selections;
    window.history.pushState({ path: newUrl }, '', newUrl);

    await navigator.clipboard.writeText(newUrl);
    alert('Sharable URL copied to clipboard!');
});

/**
 * Parses the current URL and updates the map/table state to match the information in the URL (if applicable)
 */
function parseUrl() {
    let urlParams = new URLSearchParams(window.location.search);
    let selections = urlParams.get("selections");

    if (!selections) {
        return;
    }

    // Update the table checkboxes with the selected restaurants
    let table = document.getElementById("sidebar-table-body");
    for (let row of table.rows) {
        let name = row.cells[0].innerText;
        if (selections.includes(normalizeName(name))) {
            row.cells[row.cells.length - 1].children[0].checked = true;
        }
        else {
            row.cells[row.cells.length - 1].children[0].checked = false;
        }
    }

    applyFilters();
    updateAllMarkersShown();
}


/**********************************
**** DISTANCE ISOCHRONE FILTER ****
**********************************/
/**
 * When distance filter add button clicked, set state that next map click will draw isochrone
 */
document.getElementById("distance-filter-add-button").addEventListener("click", function() {
    placingIsochrone = true;
    // document.body.style.cursor = "";
});

/**
 * When distance filter remove button clicked, remove the isochrone
 */
document.getElementById("distance-filter-remove-button").addEventListener("click", function() {
    removeIsochrone();
    // document.body.style.cursor = "";
});

/**
 * Remove isochrone drawing from map and update which restaurants are shown
 */
window.removeIsochrone = function() {
    if (!isochroneFilter) {
        return;
    }

    map.removeLayer(isochroneFilter);
    isochroneFilter = null;
    applyFilters();
}

/**
 * Determine if a restaurant is located within the isochrone
 * @param {string} name Name of the restaurant to check
 * @returns Boolean true/false
 */
function passesIsochroneFilter(name) {
    if (!isochroneFilter) {
        return true;
    }

    let polygon = isochroneFilter.toGeoJSON().features[0].geometry.coordinates[0];
    let boundingBox = isochroneFilter.getBounds();

    // Get restaurant info
    let long = restaurants[normalizeName(name)]["gps"].split(",")[1];
    let lat = restaurants[normalizeName(name)]["gps"].split(",")[0];
    let isInside = false;

    // Initial check of if restaurant is in the bounding box
    let marker = markers[normalizeName(name)];
    if (boundingBox.contains(marker.getLatLng())) {
        // If inside bounding box, do more detailed check if in the isochrone polygon
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            let polyLong1 = polygon[i][0], polyLat1 = polygon[i][1];
            let polyLong2 = polygon[j][0], polyLat2 = polygon[j][1];

            let intersect = ((polyLat1 > lat) !== (polyLat2 > lat)) &&
                (long < (polyLong2 - polyLong1) * (lat - polyLat1) / (polyLat2 - polyLat1) + polyLong1);

            if (intersect) {
                isInside = !isInside;
            } 
        }
    }

    return isInside;
}

/**
 * Draw a new isochrone on the map and only shown restaurants within it
 * @param {*} lat Latitude of the isochrone center
 * @param {*} long Longitude of the isochrone center
 * @param {*} distanceInput HTML input element containing the isochrone range in minutes
 */
async function drawAndApplyDistanceIsochrone(lat, long, distanceInput) {
    // Get isochrone polygon from ORS API call
    let distanceInMinutes = distanceInput.value;
    if (distanceInMinutes == "") {
        console.log("ERROR: Input a time for draw isochrone");
        return;
    }

    let data = null;
    if (debug) {
        data = mockIsochrone;
    }
    else {
        let response = await fetch(
            "https://api.openrouteservice.org/v2/isochrones/driving-car",
            {
                method: "POST",
                headers: {
                    "Authorization": ORS_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    locations: [[long, lat]],
                    range: [distanceInMinutes * 60],
                    range_type: "time"
                })
            }
        );
        data = await response.json();
        console.log(data);
    }

    // Draw the received polygon
    if (isochroneFilter) {
        map.removeLayer(isochroneFilter)
    }

    isochroneFilter = L.geoJSON(data, {
        style: {
            color: "red",
            weight: 2,
            fillOpacity: 0.3
        }
    })
    .bindPopup(`<b>Distance Filter</b><br>
            Locations reachable in ${distanceInMinutes} minutes<br>
            <a onclick=removeIsochrone() href="#">Click to remove</a>`)
    .addTo(map);

    // Apply the isochrone filter
    applyFilters();
}

/**
 * Check if user is applying a distance filter when the map is clicked
 */
map.on("click", (event) => {
    if (placingIsochrone) {
        placingIsochrone = false;
        let lat = event["latlng"]["lat"];
        let long = event["latlng"]["lng"];
        drawAndApplyDistanceIsochrone(lat, long, document.getElementById("distance-filter-input"));
    }
})