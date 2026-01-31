let recipeIndex = 0;
let recipeHeights = {};

/*-- ================================================ --->
<---                  INITIALIZATION                  --->
<--- ================================================ --*/
/**
 * Initializes the page on load
 */
document.addEventListener("DOMContentLoaded", () => {
    initializeBook();
    updatePageButtons();
});

function initializeBook() {
    let recipes = document.querySelectorAll(".recipe");
    recipes.forEach((recipeElement) => {
        recipeHeights[recipeElement.id] = recipeElement.scrollHeight;
        recipeElement.style.display = "none";
    });

    recipes[recipeIndex].style.display = "block";
}


/*-- ================================================ --->
<---                  FLIP BOOK PAGE                  --->
<--- ================================================ --*/
function updatePageButtons() {
    let recipes = document.querySelectorAll(".recipe");
    console.log(`recipeIndex = ${recipeIndex}`);
    document.getElementById("previous-recipe-button").disabled = (recipeIndex == 0);
    document.getElementById("next-recipe-button").disabled = (recipeIndex == recipes.length - 1);
    document.getElementById("table-contents-button").disabled = (recipeIndex == 0);
}

function updateBookHeight() {
    let bookContainer = document.getElementById("book-container");
    let recipes = document.querySelectorAll(".recipe");
    bookContainer.style.height = `${recipeHeights[recipes[recipeIndex].id] / 2}px`;
}

function flipForwards(newIndex) {
    console.log(`Going from page ${recipeIndex} to ${newIndex}`);
    let recipes = document.querySelectorAll(".recipe");
    if (newIndex >= recipes.length || newIndex <= recipeIndex) {
        return;
    }

    // Hide page text
    recipes.forEach((recipeElement) => {
        recipeElement.style.display = "none";
    });

    // Change background to show animation
    let bookContainer = document.getElementById("book-container");
    bookContainer.style.backgroundImage = 'url("../images/recipes/bigbook_crop.gif")';

    // Go back to static image and show page after animation is done
    setTimeout(() => {
        recipes[newIndex].style.display = "block";
        recipeIndex = newIndex;
        bookContainer.style.backgroundImage = 'url("../images/recipes/bigbook_crop_static.png")';
        updatePageButtons();
        updateBookHeight();
    }, 1250);
}
function flipBackwards(newIndex) {
    console.log(`Going from page ${recipeIndex} to ${newIndex}`);
    let recipes = document.querySelectorAll(".recipe");
    if (newIndex < 0 || newIndex >= recipeIndex) {
        return;
    }

    // Hide page text
    recipes.forEach((recipeElement) => {
        recipeElement.style.display = "none";
    });

    // Change background to show animation
    let bookContainer = document.getElementById("book-container");
    bookContainer.style.backgroundImage = 'url("../images/recipes/bigbook_crop_reverse.gif")';

    // Go back to static image and show page after animation is done
    setTimeout(() => {
        recipes[newIndex].style.display = "block";
        recipeIndex = newIndex;
        bookContainer.style.backgroundImage = 'url("../images/recipes/bigbook_crop_static.png")';
        updatePageButtons();
        updateBookHeight();
    }, 1250);
}

document.getElementById("previous-recipe-button").addEventListener("click", function() {
    console.log(`previous click`);
    flipBackwards(recipeIndex - 1);
});
document.getElementById("next-recipe-button").addEventListener("click", function() {
    console.log(`next click`);
    flipForwards(recipeIndex + 1);
});
document.getElementById("table-contents-button").addEventListener("click", function() {
    console.log(`table of contents`);
    flipBackwards(0);
});

function goToPage(newIndex) {
    console.log(`goToPage(${newIndex}) when recipeIndex=${recipeIndex}`);
    // Play the book animation
    if (newIndex > recipeIndex) {
        flipForwards(newIndex);
    }
    else if (newIndex < recipeIndex) {
        flipBackwards(newIndex);
    }
}
function goToPageFromId(id) {
    console.log(`goToPageFromId(${id})`);
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