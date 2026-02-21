document.addEventListener("DOMContentLoaded", () => {
    randomizeMargins();
    reorganizeMasonry();
});

/**
 * Apply a randomized margin to each photo window to make them not perfectly aligned
 */
function randomizeMargins() {
    let photos = document.querySelectorAll(".photo-window");
    photos.forEach(photo => {
        let hmin = -6;
        let hmax = 6;
        let hmargin = Math.floor(Math.random() * (hmax - hmin + 1) + hmin);

        let vmin = 10 - 6;
        let vmax = 10 + 6;
        let vmargin = Math.floor(Math.random() * (vmax - vmin + 1) + vmin);

        photo.style.margin = `${vmargin}px ${hmargin}px`;
    });
}




/**
 * Reorganizes the photo grid to fill by rows, rather than by columns
 * Context: I want the photobook to be a masonry style grid (AKA a grid of elements, where the rows do not align e.g., pinterest)
 * This is easily achieved with pure CSS, except the CSS solution will fill the grid column first
 * I wanted the grid to fill by row instead. To my knowledge, this is not achievable in pure CSS
 * (there is a masonry layout in development, but it is not supported by all browsers, so I am not using it)
 * So, I use JavaScript to reorganize the layout when the page is loaded and when the column count changes to fit my desires
 */
let originalOrganization = null;
let previousNumColumns = -1;
window.addEventListener("resize", () => {
    reorganizeMasonry();
});
function reorganizeMasonry() {
    // calculate the number of columns in the masonry grid
    let photobook = document.getElementById("photobook-wrapper");
    let wrapperWidth = parseFloat(window.getComputedStyle(photobook).width) + 10;
    let columnWidth = parseFloat(window.getComputedStyle(photobook).columnWidth);
    let columnGap = parseFloat(window.getComputedStyle(photobook).columnGap);
    let numColumns = Math.floor(wrapperWidth / (columnWidth + columnGap));

    console.log("======================")
    console.log(`wrapperWidth = ${wrapperWidth}`);
    console.log(`columnWidth = ${columnWidth}`);
    console.log(`columnGap = ${columnGap}`);
    console.log(`wrapperWidth / (columnWidth + columnGap) = ${(wrapperWidth) / (columnWidth + columnGap)}`);
    console.log(`numColumns = ${numColumns}`);


    // skip reordering if the number of columns has not changed
    if (previousNumColumns == numColumns || numColumns == 0) {
        return;
    }
    console.log("REORDERING MASONRY");
    previousNumColumns = numColumns;

    // create a "desired column" list for each column
    let colStacks = [];
    for (let i = 0; i < numColumns; i++) {
        colStacks.push([]);
    }

    // store the original organization since it will need to be referenced when changing column count
    if (originalOrganization == null) {
        let photosNodeList = document.querySelectorAll(".photo-window");
        originalOrganization = [...photosNodeList];
    }

    // put each photo into the desired column
    let photos = originalOrganization;
    photos.forEach((photo, i) => {
        colStacks[i % numColumns].push(photo.outerHTML);
    });

    // replace the HTML content with the new columns
    photobook.innerHTML = "";
    for (let i = 0; i < numColumns; i++) {
        colStacks[i].forEach((photoHtml) => {
            photobook.innerHTML += photoHtml;
        });
    }
}