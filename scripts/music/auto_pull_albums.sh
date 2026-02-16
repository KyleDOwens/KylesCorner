#!/bin/bash

# Pull all the songs from the "Organized Albums 20XX" playlist (this will update the CSV to match the playlist)
powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\kyles_world\\scripts\\music\\pull_albums_list.py'"

# Download all new album art (unless explicitly told not to, for when just reorganizing)
if [[ $1 != skip_art ]]; then
    powershell.exe -Command "python '\\\\wsl$\\Ubuntu\\home\\kyledowens\\projects\\kyles_world\\scripts\\music\\download_album_art.py'"
fi

rm .cache
