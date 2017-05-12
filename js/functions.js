//function to match the new layers
function matchLayers(layers){
	if (!mapHasBothLayers()) return;
	
	layers.eachLayer(function(layer){
		if (!isInBothLayers(layer.feature.properties.name)) return;
		var matchLine = getMatchLine(layer.feature.properties.name);
		lineLayer.addLayer(matchLine);
	});
	
}


// function to create match lines if there are at least one feature for both layers
function getMatchLine(layerIndex){
	var start = drawnIndex[layerIndex].getBounds().getCenter();
	var end = pointIndex[layerIndex].getLatLng();
	var line = new L.Polyline([start, end], matchLineStyle);
	var feature = line.feature = line.feature || {};
	feature.properties = {name:layerIndex};
	line.bindPopup(layerIndex);
	lineIndex[layerIndex] = line;
	return line;
}

//function to handle feature creation
function featureCreated(event){
	var layer = event.layer || event.target || event;
	
	var name = layer.feature.properties.name;
	
	// prevent creation of duplicate features
	while (true){
		if (isNameAvailable(name)){
			layer.setStyle(drawnPolyStyle);
			layer.setPopupContent(name);
			drawnItems.addLayer(layer);
			drawnIndex[layer.feature.properties.name] = layer;
			matchLayers((new L.featureGroup()).addLayer(layer));
			break;
		}else{
			name = prompt("Please enter a unique name");
			if (!name) break;
		}
	}
}


//function to handle geographic edits on map
function featuresEdited(event){
	var layers = event.layers || event.target || event;
	layers.eachLayer(function(layer){
		var name = layer.feature.properties.name;
		var line = getMatchLine(name);
		lineLayer.removeLayer(lineIndex[name]);
		delete(lineIndex[name]);
		lineLayer.addLayer(line);
		lineIndex[name] = line;
	});
}

//function to handle feature deletions
function featuresDeleted(event){
	var layers = event.layers || event.target || event;
	layers.eachLayer(function(layer){
		var name = layer.feature.properties.name;
		delete(drawnIndex[name]);
		lineLayer.removeLayer(lineIndex[name]);
		delete(lineIndex[name]);
	});
}

//function to handle feature deletions
function featuresRenamed(event){
	var layers = event.layers || event.target || event;
	if (layers.getLayers().length>0){
		layers.eachLayer(function(layer){
			var name = layer.feature.properties.name;
			var oldName = layer.feature.properties.oldName;
			// add layer to new key
			drawnIndex[name] = drawnIndex[oldName];
			
			//remove old index and old layer
			delete(drawnIndex[oldName]);
			lineLayer.removeLayer(lineIndex[oldName]);
			delete(lineIndex[oldName]);
			
			// add if new named feature is in both layers
			if (!isInBothLayers(name)) return;
			var line = getMatchLine(name);
			lineLayer.addLayer(line);
			lineIndex[name] = line;
		});
	}
}


//function to handle feature fetch
function featureFetched(e){
	if (!e.error){
		var layers = e.pointlayer || e.polylayer;
				
		if (e.filetype == 'kml'){
			drawnItems.clearLayers();
			layers.setStyle(polyStyle);
			layers.eachLayer(function(lyr){
				lyr.bindPopup(lyr.feature.properties.name);
				drawnItems.addLayer(lyr);
				drawnIndex[lyr.feature.properties.name] = lyr;
			});
		}
		else if (e.filetype == 'csv'){
			pointLayer.clearLayers();
			layers.setStyle(pointStyle);
			layers.eachLayer(function(lyr){
				lyr.bindPopup(lyr.feature.properties.name);
				pointLayer.addLayer(lyr);
				pointIndex[lyr.feature.properties.name] = lyr;
			});
		}
		matchLayers(layers);
		map.fitBounds(layers.getBounds());
	}else {
		console.log(e);
	}
}

//remove layer from map if the layer is out of bounds
function removeIfOutOfBounds(event){
	var layer = event.layer || event.layers || event.target || event;
	test = layer;
	var mapBounds = map.getBounds();
	if (layer.constructor == L.CircleMarker){
		//check if coordinates within map current view
		if(!mapBounds.contains(layer.getLatLng())){
			map.removeLayer(layer);
		}else {
			map.addLayer(layer);
		}
	}
	else if (layer.constructor == L.Polygon){
		if (!mapBounds.intersects(layer.getBounds())){
			map.removeLayer(layer);
		}else{
			map.addLayer(layer);
		}
	}
}


//function to add or remove features on zoom or pan
function updateRender(event){
	if (map.hasLayer(drawnItems) && drawnItems.getLayers().length > 0) {
		drawnItems.eachLayer(removeIfOutOfBounds);
	}
	if (map.hasLayer(pointLayer) && pointLayer.getLayers().length > 0) {
		pointLayer.eachLayer(removeIfOutOfBounds);
	}
	if (map.hasLayer(lineLayer) && lineLayer.getLayers().length > 0) {
		lineLayer.eachLayer(removeIfOutOfBounds);
	}
	console.log(Object.keys(map._layers).length);
}


function isInBothLayers(index){
	if (pointIndex[index] && drawnIndex[index]) return true;
	else return false;
}

function getPolyCount(){
	return drawnItems.getLayers().length;
}

function getPointCount(){
	return pointLayer.getLayers().length;
}

function mapHasBothLayers(){
	if (getPointCount() > 0 && getPolyCount() > 0){
		return true;
	}else {
		return false;
	}
}

function isNameAvailable(name){
	if (drawnIndex[name]) return false;
	return true;
}

function createAlert(s){
	alert (s);
}

function logEvent(event){ console.log(event);}