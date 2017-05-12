# LeafletDigitizer
A digitizer for data surveys for digitizing polygons according to surveys uploaded to an ODK platform or point data on spreadsheet.

##Task completed so far
1. Created a map interface and imported Leaflet.Draw
2. Added a prompt for getting feature name when digitization completes
3. Inserted the obtained feature name into the newly created feature such that its compatible to .toGeoJSON() function
4. Reduced the vertex square size
5. Created a rename control and integrated it with L.Draw
6. Import point files from csv
7. Import polygon from kml
8. export to kml file
9. Styled layers
10. Matched layers and created match lines
11. remove match lines on polygon delete
12. handle duplicates
13. managed match lines on geographic edit
14. manage match lines on layer rename

##TO-DO
0. Import point data from URL (discarded idea)

##Libraries used
1. Leaflet
2. Leaflet.Draw
3. tokml.js
4. togeojson.js
5. filesaver.js
