var map = new L.Map('map', { center: new L.LatLng(27.702071829315642, 85.33166885375978), zoom: 13}),
		drawnItems = L.featureGroup().addTo(map),
		pointLayer = L.featureGroup().addTo(map),
		lineLayer = L.featureGroup().addTo(map);

var layercontrol = L.control.layers({},{
	"Google Image": L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
		attribution: 'Google',
		maxZoom: 20,
		maxNativeZoom :18
	}),
	"Digitizations ": drawnItems,
	"Points (GPS)": pointLayer,
	"Match lines": lineLayer,
},{ position: 'topleft', collapsed: true }).addTo(map);

var pointLayer;
var drawnIndex = {}, pointIndex = {}, lineIndex = {}, duplicateIndex = {};

map.addControl(new L.Control.Draw({
	edit: {
		featureGroup: drawnItems,
		poly: {
			allowIntersection: false
		},
		rename: {
			acceptDupes: false
		}
	},
	draw: {
		polygon: {
			allowIntersection: false,
			showArea: true
		},
		polyline:false,
		rectangle:false,
		circle:false,
		marker:false
	}
}));

var ffcontrol = L.control.featureFetch({position:'topright'});
map.addControl(ffcontrol);

//add event handlers

map.on(L.Draw.Event.CREATED, featureCreated);

map.on(L.Control.FeatureFetch.FFEND, featureFetched);

map.on(L.Draw.Event.DELETED, featuresDeleted);

map.on(L.Draw.Event.EDITED, featuresEdited);

map.on(L.Draw.Event.RENAMED, featuresRenamed);

map.on("layeradd", removeIfOutOfBounds);

//map.on("zoomend", updateRender);
//
//map.on("moveend", updateRender);

map.on("resize", updateRender);