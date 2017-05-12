/*
 * @class L.RenderHelper
 * Helps with rendering large amount of data
 * Parameters
 *	1. map
 *	2. options - should include a list of featuregroups or similar layers where you can get bounds
 *
 */

L.RenderHelper = function(map, options){
	this._map = map;
	this.options = {
		grid_width:500,
		depth_level:4,
		layers:[],
	};
	//extend options
	for (i in options){
		this.options[i] = options[i]; 
	}
	this._layerBounds = this._calcLayerBounds();
}

L.RenderHelper.prototype = {
	constructor:L.RenderHelper,
	
	//function to build the grid
	_buildGrid: function(){
		if(layers.length > 0){
					
		}
	},
	
	//function to calculate combined layer bounds
	//also set a listener to update the bounds
	_calcLayerBounds(){
		var layers = this._options.layers;
		var bounds = new L.LatLngBounds();
		for (i in layers){
			bounds.extend(layers[i].getBounds());
			layers[i].on("layeradd",upBounds);
			layers[i].on("layerremove",upBounds);
		}
		var self = this;
		function upBounds (event){
			self._updateBounds();
		}
		
		return bounds;
	},
	
	//function to update bounds
	_updateBounds: function(){
		this._layerBounds = new L.LatLngBounds();
		for (i in layers){
			bounds.extend(layers[i].getBounds());
		}
	}
	
}