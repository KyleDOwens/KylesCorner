# Plan
* Website to host all hobby information
    * Restaurant list
    * Album list

* Focus on restaurant list:
    * Have google maps underlay
    * Show list on a sidebar
        * Each entry has genre, visited, notes
        * Be able to highlight specific restaurant on map
    * Have each item correspond to a marker on map
    * Be able to toggle specific restaurants on map
        * Individual or category (genre, visited, etc.)
        * Distance from some point!!!

todo:
* [-] Update ratings
* [-] Update cuisine types
* [-] Add coffee shops from google
* [-] Add bakeries from google

* [-] Add filters
    * [+] Individual items
    * [+] Cuisine Type: [input box with dropdown mapping to set of possible options]
    * [+] Visited/unvisited
    * [+] Rating (dropdown asking to select from visited ratings, or of priority to visit ratings low/medium/high)
    * [-] Within X miles of point (next click will place a point, when clicking on that point the description has input box to set radius (will need lat/long <==> miles converter) and link to delete point (allow arbitrarily many points))

* [-] Add ability to normalize colors (all same shade green/blue)

* [+] Add ability to filter by custom subset (perhaps as url parameters so can be sent as link? also need way to create subset, perhaps button in filters which will create custom url of all restaurants selected with "show")
* [-] Add compression/encoding to sharable URL

* [-] Ability to sort table?
    * [-] By name, cuisine, visited, rating?


* [?] When closing table, reset filters to the previous save
* [+] When selecting "any" check all boxes
* [+] When "any" is selected, and another box is changed, unselect "any"

* [-] Remove show/hide all matching
