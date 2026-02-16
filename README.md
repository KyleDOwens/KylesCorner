# Kyle's World

## What is this?
This is the repository for my personal website! I've been developing this website entirely from scratch the past few months. I hope for this website to be a place to share aspects of my life with people (and because it is fun making websites). This mostly includes sharing my hobbies, like music, food, and art.


## How can I visit the website?
The website domain is [kyles-world.net](kyles-world.net).


## Repository structure
The repository structure is pretty self-explanatory, but here is a quick rundown:
* `css/` the website styling and fonts
* `csv/` all the CSVs of of data loaded into my website
* `images/` all the images used on the website
* `js/` the JavaScript backend of the website
* `notes/` markdown files with my notes, plans, todo lists, etc.
* `pages/` the individual page HTML files
* `scripts/` python scripts which are used by me to help during development


## Project structure
You may notice that there are HTML files in `pages/` and in the root directory. This is because of how my development process is set up.

Currently, I use a base template HTML file which contains the design for the spreadsheet theme that is shared across all pages. This template file is `base.html`. There is no (meaningful) website content inside this file, it just serves as the base template for my overall website style. For example, this includes the background styling, nav bars, and footers. There is also an associated JS and CSS files (`js/base.js` and `css/base.css`, respectively).

The page-specific content that is displayed on each page is what is stored in each file in `pages/`. This includes all the content that is not part of the overall template. For example, `pages/music.html` only stores the HTML for displaying lists of my favorite albums, since that is the purpose of that webpage.

To create the final website, I have a custom build script (`scripts/build.py`), which combines the base template file and each page-specific HTML content into a single file. The resulting combined file is what is stored in the root directory. (It is partly stored there for easy access for github pages, which is how I am hosting the website.) The names of the combined HTML files in root will match the files in `pages/`. This is done so that way I do not have to worry about changing each HTML page whenever I alter the base template. Also, it is much easier to edit the shorter HTML files in `pages/` than edit the combined files with all the base templating taking up space.

Additionally, during the build process all the data from the CSV files is loaded into the appropriate HTML files. For example, in `csv/music` I have multiple CSV files containing my lists of favorite albums. Those CSV files are loaded and converted into HTML and inserted into the combined `music.html` file. This reduces the amount of duplicate code, allowing the structure in which I display data to be very flexible, and for it to be really easy for me to add/modify/delete data. 

The final website is completely static so it can be hosted using github pages. There is one sort-of-exception to the website being static, which is the map viewer in the `restaurants` page. That uses OpenStreetMap and LeafletJS to display an interactive map for the user. I'd like to replace that with my own map viewer program one day, but that is very low on my priority list, so for now it will stay that way.
