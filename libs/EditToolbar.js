/*L.Map.mergeOptions({
 editControl: true
 });*/
/**
 * @class L.EditToolbar
 * @aka EditToolbar
 */
L.EditToolbar = L.Toolbar.extend({
	statics: {
		TYPE: 'edit'
	},

	options: {
		edit: {
			selectedPathOptions: {
				dashArray: '10, 10',

				fill: true,
				fillColor: '#fe57a1',
				fillOpacity: 0.1,

				// Whether to user the existing layers color
				maintainColor: false
			}
		},
		remove: {},
		rename: {},
		savekml: {},
		poly: null,
		featureGroup: null /* REQUIRED! TODO: perhaps if not set then all layers on the map are selectable? */
	},

	// @method intialize(): void
	initialize: function (options) {
		// Need to set this manually since null is an acceptable value here
		if (options.edit) {
			if (typeof options.edit.selectedPathOptions === 'undefined') {
				options.edit.selectedPathOptions = this.options.edit.selectedPathOptions;
			}
			options.edit.selectedPathOptions = L.extend({}, this.options.edit.selectedPathOptions, options.edit.selectedPathOptions);
		}

		if (options.remove) {
			options.remove = L.extend({}, this.options.remove, options.remove);
		}
		
		if (options.rename) {
			options.rename = L.extend({}, this.options.rename, options.rename);
		}
		
		if (options.savekml) {
			options.savekml = L.extend({}, this.options.savekml, options.savekml);
		}

		if (options.poly) {
			options.poly = L.extend({}, this.options.poly, options.poly);
		}

		this._toolbarClass = 'leaflet-draw-edit';
		L.Toolbar.prototype.initialize.call(this, options);

		this._selectedFeatureCount = 0;
	},

	// @method getModeHandlers(): object
	// Get mode handlers information
	getModeHandlers: function (map) {
		var featureGroup = this.options.featureGroup;
		return [
			{
				enabled: this.options.edit,
				handler: new L.EditToolbar.Edit(map, {
					featureGroup: featureGroup,
					selectedPathOptions: this.options.edit.selectedPathOptions,
					poly: this.options.poly
				}),
				title: L.drawLocal.edit.toolbar.buttons.edit
			},
			{
				enabled: this.options.remove,
				handler: new L.EditToolbar.Delete(map, {
					featureGroup: featureGroup
				}),
				title: L.drawLocal.edit.toolbar.buttons.remove
			},
			{
				enabled: this.options.rename,
				handler: new L.EditToolbar.Rename(map, {
					featureGroup: featureGroup,
					acceptDupes: this.options.rename.acceptDupes
				}),
				title: L.drawLocal.edit.toolbar.buttons.rename
			},
			{
				enabled: this.options.savekml,
				handler: new L.EditToolbar.SaveKml(map, {
					featureGroup: featureGroup
				}),
				title: L.drawLocal.edit.toolbar.buttons.savekml
			}
		];
	},

	// @method getActions(): object
	// Get actions information
	getActions: function () {
		return [
			{
				title: L.drawLocal.edit.toolbar.actions.save.title,
				text: L.drawLocal.edit.toolbar.actions.save.text,
				callback: this._save,
				context: this
			},
			{
				title: L.drawLocal.edit.toolbar.actions.cancel.title,
				text: L.drawLocal.edit.toolbar.actions.cancel.text,
				callback: this.disable,
				context: this
			}
		];
	},

	// @method addToolbar(map): L.DomUtil
	// Adds the toolbar to the map
	addToolbar: function (map) {
		var container = L.Toolbar.prototype.addToolbar.call(this, map);

		this._checkDisabled();

		this.options.featureGroup.on('layeradd layerremove', this._checkDisabled, this);

		return container;
	},

	// @method removeToolbar(): void
	// Removes the toolbar from the map
	removeToolbar: function () {
		this.options.featureGroup.off('layeradd layerremove', this._checkDisabled, this);

		L.Toolbar.prototype.removeToolbar.call(this);
	},

	// @method disable(): void
	// Disables the toolbar
	disable: function () {
		if (!this.enabled()) {
			return;
		}

		this._activeMode.handler.revertLayers();

		L.Toolbar.prototype.disable.call(this);
	},

	_save: function () {
		this._activeMode.handler.save();
		if (this._activeMode) {
			this._activeMode.handler.disable();
		}
	},

	_checkDisabled: function () {
		var featureGroup = this.options.featureGroup,
			hasLayers = featureGroup.getLayers().length !== 0,
			button;

		if (this.options.edit) {
			button = this._modes[L.EditToolbar.Edit.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
					L.drawLocal.edit.toolbar.buttons.edit
					: L.drawLocal.edit.toolbar.buttons.editDisabled
			);
		}

		if (this.options.remove) {
			button = this._modes[L.EditToolbar.Delete.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
					L.drawLocal.edit.toolbar.buttons.remove
					: L.drawLocal.edit.toolbar.buttons.removeDisabled
			);
		}
		
		if (this.options.rename) {
			button = this._modes[L.EditToolbar.Rename.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
					L.drawLocal.edit.toolbar.buttons.rename
					: L.drawLocal.edit.toolbar.buttons.renameDisabled
			);
		}
		
		if (this.options.savekml) {
			button = this._modes[L.EditToolbar.SaveKml.TYPE].button;

			if (hasLayers) {
				L.DomUtil.removeClass(button, 'leaflet-disabled');
			} else {
				L.DomUtil.addClass(button, 'leaflet-disabled');
			}

			button.setAttribute(
				'title',
				hasLayers ?
					L.drawLocal.edit.toolbar.buttons.savekml
					: L.drawLocal.edit.toolbar.buttons.savekmlDisabled
			);
		}
	}
});
