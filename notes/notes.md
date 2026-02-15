# Introduciton
This document contains all of my notes for this entire project.

# Table of Contents
* [Introduction](#introduciton) - explaination of this document's purpose
* [How-Tos](#how-tos) - guides to remind me how I did things during the development process
* [Script Documentation](#scripts-documentation) - documentation of what each of my custom developmental aid scripts do
* [Resources](#resources) - links to tools and sources of inspiration for me



# How-Tos
## How to export locations from Google Maps:


* Follow the directions on the webpage to export you Google Maps data from [Google Takeout](https://takeout.google.com/settings/takeout)
* Upload the CSV of the list you want to upload to the website
* Once you recieve the confirmation email, follow the confirmation link to start the task
* Do this well ahead of time, you may have to wait hours/days for the task to complete
* The resulting CSV should contain lat/long information for all locations
* Any locations that errored will need to ve fixed manually



# Scripts Documentation
## Website-wide scripts
### build.py
This is a script that builds all of my individual components into a complete static website. It will create the build/ directory which will contain all the static HTML, CSS, and JavaScript elements. This should be run from the project directory (not the scrips directory).

This performs a few major functions:
1) Applies the base "excel template" to all pages
2) Loads all CSV information into static HTML

#### === Details for step 1 ===
I have designed this website to have a stylistic theme of looking like 90s Excel. So, the website is intended to look as if it is running an old Excel program, where the content of the website is contained within the Excel sheets of the program.

As a result, all pages share the same base design of the "Excel program". It is only the content within the program that differs. The design of that "Excel program" is refered to as the "base" or the "template". All pages share this exact same template. 

However, I (obviously) do not want to repeatedly copy-paste that template into each subpages' HTML for reasons that should be obvious. Additionally, as a self-imposed rule I want my website to be static, ruling out server-side or client-side solutions. So, I have decided to create a build script that will build each page for me, combining the HTML/CSS/Javascript of the template with the content of the individual webpages. There are existing tools for this, but I have decided to create my own version for fun.

Each page's individual content will be stored within a file following the naming format page-overlay.html. Within the template (`base.html`), each individual page's content will be inserted into the `div` with id "sheet-overlay". The result will be copied into the corresponding output file named `build/page.html`.

For CSS and JavaScript, the format is simpler. I straight up concatenate the page's CSS/JavaScript file to the base's CSS/Javascript file. The output is copied into `build/css/page.css` and `build/js/page.js`.

#### === Details for step 2 ===
A few of the pages have the purpose of visually displaying data stored in a CSV. In particular, these pages are the album list(s) and the restaurant list.

Rather than dynamically load the data from these CSVs (which takes a significant amount of overhead), I load the CSV data into the HTML files during the build process so the entire website is static (mostly, there is an exception with the LeafletJS map, but that can be ignored for now).

This is done in a separate step *after* combining the base base and page files in step 1. To do this I load in the CSV data, format it into an HTML string, then perform a simple string replace in the destination html file. 


## Music scripts



# Resources
## Development Tools
* [Convert hex color into CSS filter](https://codepen.io/sosuke/pen/Pjoqqp)
* [Color picker from image](https://redketchup.io/color-picker)
* [Word art maker](https://www.makewordart.com/)
* [Better word art maker](https://cooltext.com/)
* [Get shades/hues of a color](https://colorkit.co/color-picker/)
* [GIF tools (crop, remove background, change speed, etc.)](https://onlinegiftools.com/#tools)
* [gif finder](https://gifcities.org/search?)
* [under construction gifs](http://www.textfiles.com/underconstruction/)

## Data tools
* [tool to export google maps data](https://takeout.google.com/settings/takeout)
* [tool to obtain additional data from google maps export](https://exportgooglemaps.com/)
* [Create static map image](https://stadiamaps.com/build-a-map/#map=9.78/29.4673/-98.5817&style=outdoors)

## "Go Build a Personal Website" Inspiration
* [Motivation for building a personal website](https://localghost.dev/blog/building-a-website-like-it-s-1999-in-2022/)
* [Motivation to the web revival movement](https://thoughts.melonking.net/guides/introduction-to-the-web-revival-1-what-is-the-web-revival)
    * [(And follow up article for building a website)](https://thoughts.melonking.net/guides/introduction-to-the-web-revival-3-make-a-website)

## Creative/Artistic Inspiration
* [Old Excel UI reference](https://handsontable.com/blog/how-the-spreadsheet-ui-changed-over-the-years)
* [Windows 98 UI designs](https://jdan.github.io/98.css/)
* [Old Web Design Museum](https://www.webdesignmuseum.org/all-websites)
* [Archive of old web designs](https://www.cameronsworld.net/)
* [Achive of old font-end design](https://makefrontendshitagain.party/)

* Inspo websites
    * https://isobelsweb.com/
    * https://katebollinger.com/
    * https://beej.us/
    * https://www.spacejam.com/1996/
    * https://anlucas.neocities.org/
    * https://aphub.neocities.org/
* [Inspo website (and my introduction to the indieweb - she also makes music, go listen)]()
* [Inspo website (Kate Bollinger - go listen to her music, it is good)]()
* [Inspo website (and has also good networking guides)]()
* [SpaceJam??!?!]()