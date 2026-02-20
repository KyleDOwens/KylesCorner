# This script is used to change the quality level of all jpegs in a folder

from PIL import Image
import os


target_dir = "images/photobook"
quality = 8


if (os.getcwd().split("/")[-1] != "kyles_world"):
    exit("ERROR: This script must be run from the project directory, not the script directory or anywhere else")


for filename in os.listdir(target_dir):
    if not filename.lower().endswith(('.jpg', '.jpeg')):
        continue

    input_path = os.path.join(target_dir, filename)
    output_path = os.path.join(target_dir, filename)

    with Image.open(input_path) as img:
        img.save(output_path, "JPEG", quality=quality, optimize=True)
        print(f"Compressed {filename}")