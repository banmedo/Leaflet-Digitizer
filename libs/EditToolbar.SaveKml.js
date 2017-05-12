/**
 * @class L.EditToolbar.SaveKml
 * @aka EditToolbar.SaveKml
 * requires libraries tokml.js and filesaver.js
 * remove related entries from EditToolbar.js if no plans to use this.
 */
L.EditToolbar.SaveKml = L.Handler.extend({
	statics: {
		TYPE: 'savekml'
	},

	includes: L.Mixin.Events,

	// @method intialize(): void
	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);

		L.Util.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._saveableLayers = this.options.featureGroup;

		if (!(this._saveableLayers instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.EditToolbar.SaveKml.TYPE;
	},

	// @method enable(): void
	// Enable the save kml toolbar
	enable: function () {
		if (this._enabled || !this._hasAvailableLayers()) {
			return;
		}
		
		//get filename and add kml extension to it
		var filename = this._getSaveFileName();

		if (filename != null){
			
			//convert feature group to geojson and then to kml
			var kml = this._getKml(this._getLayerInGeoJSON(this._saveableLayers));

			//create a blob of kml string
			var blob = new Blob([kml], {type: "text/plain;charset=utf-8"});

			//export file
			saveAs(blob, filename+ ".kml");
		}
	},
	
	_getLayerInGeoJSON: function(featureGroup){
		return featureGroup.toGeoJSON();
	},
	
	_getSaveFileName: function(){
		return prompt("Enter the export file name (without the .kml extension)");
	},
	
	_getKml: function(geojson){
		return tokml(geojson, {name: "Name"});
	},
	
	_hasAvailableLayers: function () {
		return this._saveableLayers.getLayers().length !== 0;
	}
});