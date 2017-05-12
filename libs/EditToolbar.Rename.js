/**
 * @class L.EditToolbar.Rename
 * @aka EditToolbar.Rename
 */
L.EditToolbar.Rename = L.Handler.extend({
	statics: {
		TYPE: 'rename'
	},
	options: {
		acceptDupes: true	
	},

	includes: L.Mixin.Events,

	// @method intialize(): void
	initialize: function (map, options) {
		L.Handler.prototype.initialize.call(this, map);
		
		L.Util.setOptions(this, options);

		// Store the selectable layer group for ease of access
		this._renameableLayers = this.options.featureGroup;

		if (!(this._renameableLayers instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be a L.FeatureGroup');
		}
		
		invalidNames = [];
		
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.EditToolbar.Rename.TYPE;
	},

	// @method enable(): void
	// Enable the rename toolbar
	enable: function () {
		if (this._enabled || !this._hasAvailableLayers()) {
			return;
		}
		this.fire('enabled', { handler: this.type });

		this._map.fire(L.Draw.Event.RENAMESTART, { handler: this.type });
		
		if (!this.options.acceptDupes){
			this._renameableLayers.eachLayer(function(layer){
				invalidNames.push(layer.feature.properties.name);
			});
		}

		L.Handler.prototype.enable.call(this);

		this._renameableLayers
			.on('layeradd', this._enableLayerRename, this)
			.on('layerremove', this._disableLayerRename, this);
		
		this._renamed = {};
	},

	// @method disable(): void
	// Disable the delete toolbar
	disable: function () {
		if (!this._enabled) {
			return;
		}

		this._renameableLayers
			.off('layeradd', this._enableLayerRename, this)
			.off('layerremove', this._disableLayerRename, this);

		L.Handler.prototype.disable.call(this);

		this._map.fire(L.Draw.Event.RENAMESTOP, { handler: this.type });

		this._renamed = null;
		
		invalidNames = [];
		
		this.fire('disabled', { handler: this.type });
	},

	// @method addHooks(): void
	// Add listener hooks to this handler
	addHooks: function () {
		var map = this._map;
		if (map) {
			map.getContainer().focus();

			this._renameableLayers.eachLayer(this._enableLayerRename, this);

			this._tooltip = new L.Draw.Tooltip(this._map);
			this._tooltip.updateContent({ text: L.drawLocal.edit.handlers.rename.tooltip.text });

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},

	// @method removeHooks(): void
	// Remove listener hooks from this handler
	removeHooks: function () {
		if (this._map) {
			this._renameableLayers.eachLayer(this._disableLayerRename, this);

			this._tooltip.dispose();
			this._tooltip = null;

			this._map.off('mousemove', this._onMouseMove, this);
		}
	},

	// @method revertLayers(): void
	// Revert the renamed layers back to their prior state.
	revertLayers: function () {
		// Iterate of the renamed layers indices and revert them back to old name
		for (i in this._renamed){
			var layer = this._renameableLayers._layers[i];
			
			layer.feature.properties.name = this._renamed[i];
			
			if(layer._popup) layer.setPopupContent(this._renamed[i]);
			
			layer.fire('revert-renamed', { layer: layer });
		}
	},

	// @method save(): void
	// Save renamed layers
	save: function () {
		var renamedLayers = new L.FeatureGroup();
		for( i in this._renamed){
			this._renameableLayers._layers[i].feature.properties.oldName = this._renamed[i];
			renamedLayers.addLayer(this._renameableLayers._layers[i]);
		}
		this._map.fire(L.Draw.Event.RENAMED, { layers: renamedLayers});
	},

	_enableLayerRename: function (e) {
		var layer = e.layer || e.target || e;

		layer.on('click', this._renameLayer, this);
	},

	_disableLayerRename: function (e) {
		var layer = e.layer || e.target || e;

		layer.off('click', this._renameLayer, this);

		// Remove from the deleted layers so we can't accidentally revert if the user presses cancel
		delete(this._renamed[layer._leaflet_id]);
	},

	//prompt for a new name and store old name in _renamed object
	_renameLayer: function(e){
		var layer = e.layer || e.target || e;
		
		
		var existingname = layer.feature.properties.name;
		
		while (true){
			var newname = prompt("Enter new Name of feature "+existingname); 
			if (invalidNames.indexOf(newname)==-1) break;
			alert("Please enter a unique feature name.");
		}
		
		if (newname!=null){
			if (this._renamed[layer._leaflet_id] == undefined)
				this._renamed[layer._leaflet_id] = layer.feature.properties.name;

			layer.feature.properties.name = newname;
			
			if (layer._popup) layer.setPopupContent(newname);
		}
		
		layer.fire('renamed');

	},
	
	_onMouseMove: function (e) {
		this._tooltip.updatePosition(e.latlng);
	},

	_hasAvailableLayers: function () {
		return this._renameableLayers.getLayers().length !== 0;
	}
});
