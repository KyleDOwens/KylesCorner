# Kyle's World

## What is this?
This is the repository for my personal website! I've been developing this entire website from scratch so I can share aspects of my life with people (and because it is fun making websites). This mostly includes lists for my hobbies, like music, food, and art.


## How can I visit the website?
I have not bought a domain yet.



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
You may notice that each page's HTML file looks incomplete. This is because they are. I use a template HTML file which contains the design for the spreadsheet theme shared across all pages (`base.html`). The unique content that is displayed on each page is what is stored in each file in `pages/`. I use a build script to build the website (`scripts/build.py`), which combines the template file and each webpages' HTML file together to create the final product. Duing the build process, all the data from the CSV files is loaded into the appropriate HTML files. So, the final website is completely static. All the built HTML files are stored in the root directory for easy access for github pages.

There is one exception to the website being static, which is the map viewer in the `restaurants` page. That uses OpenStreetMap to display an interactive map for the user. I'd like to replace that with my own map one day, but that is very low on my priority list, so for now it will stay that way.
