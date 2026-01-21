from html.parser import HTMLParser
import shutil
import csv
import os



# /*-- ================================================ --->
# <---               BUILD GENERIC PAGES                --->
# <--- ================================================ --*/
BUILD_DIR = "./build"
BASE_FILE = "base"

# Make build directory
if (os.getcwd().split("/")[-1] != "kyles_corner"):
    exit("ERROR: This script must be run from the project directory, not the script directory or anywhere else")

if os.path.exists(f"{BUILD_DIR}"):
    shutil.rmtree(f"{BUILD_DIR}")
os.makedirs(f"{BUILD_DIR}")
os.makedirs(f"{BUILD_DIR}/css")
os.makedirs(f"{BUILD_DIR}/js")

# Copy static content into base folder (fonts, images, base files)
shutil.copyfile(f"./css/{BASE_FILE}.css", f"./build/css/{BASE_FILE}.css")
shutil.copyfile(f"./js/{BASE_FILE}.js", f"./build/js/{BASE_FILE}.js")

shutil.copyfile(f"./js/config.js", f"./build/js/config.js") # TODO: remove

shutil.copytree("./css/fonts", "build/css/fonts", dirs_exist_ok=True)
shutil.copytree("./images", "build/images", dirs_exist_ok=True)

# Read in base info
base_html = None
with open(f"./{BASE_FILE}.html", "r") as base_file:
    base_html = base_file.read()

base_css = None
with open(f"./css/{BASE_FILE}.css", "r") as base_file:
    base_css = base_file.read()

base_js = None
with open(f"./js/{BASE_FILE}.js", "r") as base_file:
    base_js = base_file.read()

# Loop through all pages and build with base
for file in os.listdir(os.fsencode("./pages")):
    filename = os.fsdecode(file)
    page_name = filename.replace("-overlay.html", "")

    # Build HTML content
    input_html = None
    with open(f"./pages/{filename}", "r") as input_file:
        input_html = input_file.read()

    combined_html = base_html.replace("REPLACEME_PAGECONTENT", input_html)
    combined_html = combined_html.replace("REPLACEME_PAGENAME", page_name)
    
    # Build CSS
    shutil.copyfile(f"./css/{page_name}.css", f"./build/css/{page_name}.css")

    # Build JS
    if os.path.exists(f"./js/{page_name}.js"):
        script = f'<script type="module" src="js/{page_name}.js"></script>'
        combined_html = combined_html.replace("<!-- REPLACEME_SCRIPT -->", script)
        shutil.copyfile(f"./js/{page_name}.js", f"./build/js/{page_name}.js")
    
    # Save html to output
    with open(f"{BUILD_DIR}/{page_name}.html", "w") as output_file:
        output_file.write(combined_html)



# /*-- ================================================ --->
# <---               LOAD RESTAURANT DATA               --->
# <--- ================================================ --*/
restaurant_rows = ""
seen_cuisines = []
with open(f"./csv/restaurants/san_antonio.csv", "r") as restaurants_file:
    reader = csv.DictReader(restaurants_file, delimiter=",")
    next(reader, None)

    # Create row in the restaurant list table
    for row in reader:
        restaurant_rows += (
            '<tr>'
                f'<td class="name">{row["name"]}</td>'
                f'<td class="cuisine">{row["cuisine"]}</td>'
                f'<td class="visited">{row["visited"]}</td>'
                '<td class="shown">'
                    '<input type="checkbox" onclick="manuallySelectRestaurant(this)" checked="">'
                '</td>'
                f'<td class="rating hidden">{row["rating"]}</td>'
                f'<td class="notes hidden">{row["notes"]}</td>'
                f'<td class="gps hidden">{row["gps"]}</td>'
                f'<td class="originalUrl hidden">{row["originalUrl"]}</td>'
            '</tr>\n'
        )

        # Save the cuisine to make the filters later
        for cuisine in row["cuisine"].split(" / "):
            if (cuisine not in seen_cuisines):
                seen_cuisines.append(cuisine)

# Add cuisine filter
seen_cuisines.sort()
cuisine_rows = ""
for cuisine in seen_cuisines:
    cuisine_rows += f'<div class="multi-option"><label><input type="checkbox">{cuisine}</label></div>'

# Fill restaurants.html with data
unfilled_html = None
with open(f"{BUILD_DIR}/restaurants.html", "r") as input_file:
    unfilled_html = input_file.read()

filled_html = unfilled_html.replace("REPLACEME_RESTAURANTROWS", restaurant_rows)
filled_html = filled_html.replace("REPLACEME_CUISINEROWS", cuisine_rows)

with open(f"{BUILD_DIR}/restaurants.html", "w") as output_file:
    output_file.write(filled_html)

# Add LeafletJS info to restaurants.html
input_html = None
with open(f"{BUILD_DIR}/restaurants.html", "r") as input_file:
    input_html = input_file.read()

leaflet_script = '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script> <!-- TODO: -->'
leaflet_link = '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/> <!-- TODO: eventually remove reliance on LeafletJS -->'
output_html = input_html.replace("<!-- REPLACEME_EXTRASCRIPT -->", leaflet_script)
output_html = output_html.replace("<!-- REPLACEME_EXTRALINK -->", leaflet_link)

with open(f"{BUILD_DIR}/restaurants.html", "w") as output_file:
    output_file.write(output_html)



# /*-- ================================================ --->
# <---              LOAD ALBUM & SONG DATA              --->
# <--- ================================================ --*/
OLDEST_ALBUM_YEAR = 2018
OLDEST_SONG_YEAR = 2022
NEWEST_YEAR = 2025

albums_html = ""

# Build album grid for each year
for year in range(NEWEST_YEAR, OLDEST_ALBUM_YEAR - 1, -1):
    # Add the album grid container
    albums_html += f'<div class="album-grid" id="album-grid-{year}">\n'

    # Add the album contents for that year
    # (CSV content should already be in sorted order)
    with open(f"./csv/music/{year}.csv", "r") as albums_file:
        reader = csv.DictReader(albums_file, delimiter=",")
        for row in reader:
            color = "gold" if (float(row["Rating"]) >= 9) else "silver" if (float(row["Rating"]) >= 8) else "bronze" if (float(row["Rating"]) >= 7) else ""
            normalized_album = "".join(c for c in row["Album"] if c.isalnum()).lower()
            normalized_artist = "".join(c for c in row["Artist"].split(",")[0] if c.isalnum()).lower()
            img_path = f"images/music/{year}/{normalized_artist}_{normalized_album}.jpg"

            albums_html += ('\t'
                f'<div class="album-block {color}">'
                    f'<img class="album-img" src="{img_path}" width="135px" height="135px">'
                    f'<div class="album-name"><i>{row["Album"]}</i></div>'
                    f'<div class="album-artist"><b>By: </b><u>{row["Artist"]}</u></div>'
                    f'<div class="album-genre"><b>Genre: </b>{row["Genre"]}</div>'
                    f'<div class="album-favorites hidden">{row["Favorite Songs"]}</div>'
                    f'<div class="album-year hidden"><b>Release year: </b>{year}</div>'
                '</div>\n'
            )
    
    # Close the album grid container
    albums_html += f'</div>\n'

# Build song table for each year
for year in range(NEWEST_YEAR, OLDEST_SONG_YEAR - 1, -1):
    # Add the song table container
    albums_html += f'<table class="song-table" id="song-table-{year}">\n'

    # Add header
    albums_html += ('\t'
        '<thead class="song-table-header">'
            '<tr class="song-row">'
                '<th class="song-name">Song</th>'
                '<th class="song-artist">Artist</th>'
                '<th class="song-album">Album</th>'
                '<th class="song-genre">Genre</th>'
                '<th class="song-year hidden">Year</th>'
            '</tr>'
        '</thead>\n'
    )

    # Add the song contents for that year
    # (CSV content should already be in sorted order)
    albums_html += '\t<tbody>'
    with open(f"./csv/music/{year}_songs.csv", "r") as songs_file:
        reader = csv.DictReader(songs_file, delimiter=",")
        for row in reader:
            albums_html += ('\t\t'
                '<tr class="song-row">'
                    f'<td class="song-name">{row["Song"]}</td>'
                    f'<td class="song-artist">{row["Artist"]}</td>'
                    f'<td class="song-album">{row["Album"]}</td>'
                    f'<td class="song-genre">{row["Genre"]}</td>'
                    f'<td class="song-year hidden">{year}</td>'
                '</tr>\n'
            )
    
    # Close the song table container
    albums_html += '\t</tbody>'
    albums_html += '</table>\n'

# Fill music.html with data
unfilled_html = None
with open(f"{BUILD_DIR}/music.html", "r") as input_file:
    unfilled_html = input_file.read()

filled_html = unfilled_html.replace("REPLACEME_ALBUMGRID", albums_html)

with open(f"{BUILD_DIR}/music.html", "w") as output_file:
    output_file.write(filled_html)