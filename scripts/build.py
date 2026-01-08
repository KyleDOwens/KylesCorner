from html.parser import HTMLParser
import shutil
import csv
import os

class MyHTMLParser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        print("Encountered a start tag:", tag) 

    def handle_endtag(self, tag):
        print("Encountered an end tag :", tag)

    def handle_data(self, data):
        print("Encountered some data  :", data)


#######################################################
# Build the individual page HTML/CSS/JavaScript

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

    with open(f"{BUILD_DIR}/{page_name}.html", "w") as output_file:
        output_file.write(combined_html)
    
    # Build CSS
    shutil.copyfile(f"./css/{page_name}.css", f"./build/css/{page_name}.css")

    # Build JS
    shutil.copyfile(f"./js/{page_name}.js", f"./build/js/{page_name}.js")


#######################################################
# Load in CSV data to pages that need it

# Load restaurants from CSV
restaurant_rows = ""
with open(f"./csv/restaurants.csv", "r") as restaurants_file:
    reader = csv.DictReader(restaurants_file, delimiter=",")
    next(reader, None)

    for row in reader:
        restaurant_rows += (
        '<tr>'
            f'<td class="name">{row["name"]}</td>'
            f'<td class="cuisine">{row["cuisine"]}</td>'
            f'<td class="visited">{row["visited"]}</td>'
            '<td class="shown">'
                '<input type="checkbox" onclick="manuallySelectRestaurant(this)" checked="">'
            '</td>'
            f'<td class="rating" style="display:none">{row["rating"]}</td>'
            f'<td class="notes" style="display:none">{row["notes"]}</td>'
            f'<td class="gps" style="display:none">{row["gps"]}</td>'
            f'<td class="originalUrl" style="display:none">{row["originalUrl"]}</td>'
        '</tr>\n'
        )

# Fill restaurants.html with CSV data
unfilled_html = None
with open(f"{BUILD_DIR}/restaurants.html", "r") as input_file:
    unfilled_html = input_file.read()

filled_html = unfilled_html.replace("REPLACEME_RESTAURANTROWS", restaurant_rows)

with open(f"{BUILD_DIR}/restaurants.html", "w") as output_file:
    output_file.write(filled_html)


# TODO: load albums CSV data into music.html