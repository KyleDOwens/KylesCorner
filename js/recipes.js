let recipeIndex = 0;

/*-- ================================================ --->
<---                  INITIALIZATION                  --->
<--- ================================================ --*/
/**
 * Initializes the page on load
 */
document.addEventListener("DOMContentLoaded", () => {
    initialize()
    updatePageButtons();

    // Dispatch a 'resize' event to: (1) resize the mock grid, (2) resize the scrollbars, (3) resize the book container
    window.dispatchEvent(new Event('resize'));
});

/**
 * Initialize the page by hiding all recipes
 */
function initialize() {
    let recipes = document.querySelectorAll(".recipe");
    recipes.forEach((recipeElement) => {
        recipeElement.style.display = "none";
    });

    recipes[recipeIndex].style.display = "block";
}


/*-- ================================================ --->
<---                  FLIP BOOK PAGE                  --->
<--- ================================================ --*/
/**
 * Update if the next, previous, or table of contents buttons should be disabled
 */
function updatePageButtons() {
    let recipes = document.querySelectorAll(".recipe");
    document.getElementById("previous-recipe-button").disabled = (recipeIndex == 0);
    document.getElementById("next-recipe-button").disabled = (recipeIndex == recipes.length - 1);
    document.getElementById("table-contents-button").disabled = (recipeIndex == 0);
}

/**
 * Resize the recipe book to fit the size of the recipe
 */
window.addEventListener("resize", () => {
    let width = window.innerWidth;
    let bookContainer = document.getElementById("book-container");
    if (width > 1000) {
        updateBookHeight();
        bookContainer.style.backgroundImage = 'url("images/recipes/bigbook_static.png")';
    }
    else {
        bookContainer.style.backgroundImage = 'none';
    }
    console.log("RESIZE")
});
function updateBookHeight() {
    let recipe = document.querySelectorAll(".recipe")[recipeIndex];
    recipe.style.height = "fit-content";
    let recipeHeight = recipe.scrollHeight;

    if (recipeHeight >= 600) {
        let newHeight = Math.max(recipeHeight / 2 + 25, 470) ;
        recipe.style.height = `${newHeight}px`;
    }

    resizeScrollThumbs();
}

/**
 * Change the display to a new recipe, perform the page turn animation
 * @param {*} newIndex the new index being flipped too
 */
function flipForwards(newIndex) {
    let recipes = document.querySelectorAll(".recipe");
    if (newIndex >= recipes.length || newIndex <= recipeIndex) {
        return;
    }

    // Hide page text
    recipes.forEach((recipeElement) => {
        recipeElement.style.display = "none";
    });

    // If too narrow, don't do the book animation
    let width = window.innerWidth;
    if (width <= 1000) {
        recipes[newIndex].style.display = "block";
        recipeIndex = newIndex;
        updatePageButtons();
        return;
    }

    // Change background to show animation
    let bookContainer = document.getElementById("book-container");
    bookContainer.style.backgroundImage = 'url("images/recipes/bigbook_forward.gif")';

    // Go back to static image and show page after animation is done
    setTimeout(() => {
        recipes[newIndex].style.display = "block";
        recipeIndex = newIndex;
        bookContainer.style.backgroundImage = 'url("images/recipes/bigbook_static.png")';
        updatePageButtons();
        updateBookHeight();
        window.dispatchEvent(new Event('resize')); // dispatch to resize the mock grid
    }, 1250);
}
function flipBackwards(newIndex) {
    let recipes = document.querySelectorAll(".recipe");
    if (newIndex < 0 || newIndex >= recipeIndex) {
        return;
    }

    // Hide page text
    recipes.forEach((recipeElement) => {
        recipeElement.style.display = "none";
    });

    // If too narrow, don't do the book animation
    let width = window.innerWidth;
    if (width <= 1000) {
        recipes[newIndex].style.display = "block";
        recipeIndex = newIndex;
        updatePageButtons();
        return;
    }

    // Change background to show animation
    let bookContainer = document.getElementById("book-container");
    bookContainer.style.backgroundImage = 'url("images/recipes/bigbook_reverse.gif")';

    // Go back to static image and show page after animation is done
    setTimeout(() => {
        recipes[newIndex].style.display = "block";
        recipeIndex = newIndex;
        bookContainer.style.backgroundImage = 'url("images/recipes/bigbook_static.png")';
        updatePageButtons();
        updateBookHeight();
        window.dispatchEvent(new Event('resize')); // dispatch to resize the mock grid
    }, 1250);
}

/**
 * Listeners for navigation buttons
 */
document.getElementById("previous-recipe-button").addEventListener("click", function() {
    flipBackwards(recipeIndex - 1);
});
document.getElementById("next-recipe-button").addEventListener("click", function() {
    flipForwards(recipeIndex + 1);
});
document.getElementById("table-contents-button").addEventListener("click", function() {
    flipBackwards(0);
});

/**
 * Go directly to a new page, rather than moving one forward/backward
 * @param {*} newIndex 
 */
function goToPage(newIndex) {
    // Play the book animation
    if (newIndex > recipeIndex) {
        flipForwards(newIndex);
    }
    else if (newIndex < recipeIndex) {
        flipBackwards(newIndex);
    }
}
function goToPageFromId(id) {
    let recipes = document.querySelectorAll(".recipe");
    for (let i = 0; i < recipes.length; i++) {
        if (recipes[i].id == id) {
            goToPage(i);
            return;
        }
    }
}
document.querySelectorAll(".recipe-link").forEach((recipeLink, i) => {
    recipeLink.addEventListener("click", function() {
        goToPageFromId(recipeLink.dataset.linkTo);
    });
});