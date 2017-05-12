var test;
/**
 * @class L.FeatureFetch
 * @aka FeatureFetch
 * requires libraries togeojson.js
 */
L.Control.FeatureFetch = L.Control.extend({
	
	options:{
		position:'topright',
	},
	statics:{
		FFSTART: 'featurefetchstart',
		FFEND: 'featurefetchend',
	},
	
	onAdd: function(map){
//		initialize some object variables
		var self = this;
		this._pointGroup = new L.FeatureGroup();
		this._polygonGroup = new L.FeatureGroup();
		this._pointsLoaded = false;
		this._polygonsLoaded = false;
		
		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
 
		container.style.backgroundColor = 'white';
		container.style.width = '30px';
		container.style.height = '30px';
		container.style.overflow = 'hidden';
		
		var anchor = L.DomUtil.create('a');
		anchor.style.backgroundImage = 'url(libs/images/dig_custom.svg)';
		
		var inp = L.DomUtil.create('input');
		inp.type = 'file';
		inp.accept = '.csv,.kml';
		inp.style.opacity = 0;
		inp.style.height = '30px';
		
		container.appendChild(anchor);
		anchor.appendChild(inp);
		
		container.onmouseenter = inp.onmouseenter = function(e){
			container.style.backgroundColor = "#fafafa";
		};
		
		container.onmouseout = inp.onmouseout = function(e){
			container.style.backgroundColor = "white";
		};
		
		//on file select
		inp.onchange = function(e){
			self._onFileSelect(self,inp,e);
			inp.value = "";
		};
		return container;
	},
	_onFileSelect : function(self,inp,e){
		console.log(0);
		//disable button to prevent spamming
		self._disableBtn(inp);
		
		//get the first file
		var file = e.target.files[0];

		if (file){
			//split the name to check extension
			var name = file.name.split(".");

			//get number of sections and check last one
			var arlen = name.length;

			//get the extension of the file
			var filetype = name[arlen-1].trim().toLowerCase();

			//check if extension is csv
			if (filetype=='csv'){
				
				//fire reading start
				map.fire(L.Control.FeatureFetch.FFSTART,{filetype:'csv', filename:file.name});

				var reader = new FileReader();

				//handle what to do on read complete
				reader.onload = function(e){
					var contents = e.target.result;
					console.log(contents);

					//get rows by splitting on new line
					var rows = contents.split("\n");

					//split first (header) row into columns
					var col = rows[0].split(",");
					test = col;

					//get index of column containing gps data
					var gpsindex = -1;
					var nameindex = -1;

					for(i in col){
						if (col[i].trim().toLowerCase()=="gps") gpsindex=i;
						else if (col[i].trim().toLowerCase()=="name") nameindex=i;
					}
					
					if (!(gpsindex + nameindex < 0 )){
						for (i=1;i<rows.length-1;i++){
							col = rows[i].split(",");
							var name = col[nameindex], gps = col[gpsindex].split(" ");
							var lat = gps[0], lng = gps[1];
							var circle = L.circleMarker(L.latLng(lat,lng),{});
							circle.feature = {};
							circle.feature.type = "Feature";
							circle.feature.properties = {name:name};
							self._pointGroup.addLayer(circle);
						}
						self._pointsLoaded = true;
						self._enableBtn(inp);
						map.fire(L.Control.FeatureFetch.FFEND,{filetype:'csv', filename:file.name, pointlayer:self._pointGroup})
					}else {
						self._enableBtn(inp);
						map.fire(L.Control.FeatureFetch.FFEND,{error:true,errordesc:"Please make sure the CSV file has header row with the column containing gps coordinates named 'gps' and the column containing matching id named 'name' "})
					}
				}

				//initiate reading file
				reader.readAsText(file);
			}
			else if (filetype=='kml') {
				map.fire(L.Control.FeatureFetch.FFSTART,{filetype:'kml', filename:file.name})
				
				var reader = new FileReader();
				
				reader.onload = function(e){
					var kml = (new window.DOMParser()).parseFromString(e.target.result,"text/xml");
					//console.log(kml);
					var gj = toGeoJSON.kml(kml);
					self._polygonGroup = L.geoJson(gj);
					self._polygonsLoaded = true;
					self._enableBtn(inp);
					map.fire(L.Control.FeatureFetch.FFEND,{filetype:'kml', filename:file.name, polylayer:self._polygonGroup})
				}
				
				reader.readAsText(file);
			}
			else{
				self._enableBtn(inp);
				map.fire(L.Control.FeatureFetch.FFEND,{error:true,errordesc:"Please select a csv or a kml file"})
			}
		}
	},
	getPointFeatures: function(){
		return this._pointGroup();	
	},
	getPolyFeatures: function(){
		return this._polygonGroup();
	},
	hasBothLayersLoaded: function(){
		return (this._pointsLoaded && this._polygonsLoaded);
	},
	_enableBtn: function(inp){inp.disable = false;},
	_disableBtn: function(inp){inp.disable = true;},
});

L.control.featureFetch = function (options){
	return new L.Control.FeatureFetch(options);
}