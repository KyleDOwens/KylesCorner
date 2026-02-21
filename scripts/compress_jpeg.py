# This script is used to change the quality level of all jpegs in a folder

from PIL import Image
import os


def compressDir(target_dir, quality):
    if (os.getcwd().split("/")[-1] != "kyles_world"):
        exit("ERROR: This script must be run from the project directory, not the script directory or anywhere else")


    for filename in os.listdir(target_dir):
        if not filename.lower().endswith(('.jpg', '.jpeg')):
            continue

        input_path = os.path.join(target_dir, filename)
        output_path = os.path.join(target_dir, filename)

        with Image.open(input_path) as img:
            img.save(output_path, "JPEG", quality=quality, optimize=True)
            print(f"Compressed {target_dir}/{filename} to quality {quality}")



# Keep track of quality used for each dir
dirs = [
    ("images/music/2018", 13),
    ("images/music/2019", 13),
    ("images/music/2020", 13),
    ("images/music/2021", 13),
    ("images/music/2022", 13),
    ("images/music/2023", 13),
    ("images/music/2024", 13),
    ("images/music/2025", 13),
    ("images/music/favorites", 13),
    # ("images/photobook/china", 8),
    # ("images/photobook/camino", 8),
]

for d, q in dirs:
    compressDir(d, q)