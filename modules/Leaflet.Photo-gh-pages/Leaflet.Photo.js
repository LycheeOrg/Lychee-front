L.Photo = L.FeatureGroup.extend({
	options: {
		icon: {
			iconSize: [40, 40]
		}
	},

	initialize: function (photos, options) {
		L.setOptions(this, options);
		L.FeatureGroup.prototype.initialize.call(this, photos);
	},

	addLayers: function (photos) {
		if (photos) {
			for (var i = 0, len = photos.length; i < len; i++) {
				this.addLayer(photos[i]);
			}
		}
		return this;
	},

	addLayer: function (photo) {
		L.FeatureGroup.prototype.addLayer.call(this, this.createMarker(photo));
	},

	createMarker: function (photo) {
		var marker = L.marker(photo, {
			icon: L.divIcon(L.extend({
				html: '<img src="' + photo.thumbnail + '" ' + (photo.thumbnail2x!=='' ? 'srcset="' + photo.thumbnail + ' 1x, ' + photo.thumbnail2x + ' 2x"' : '' )+ '></img>​',
				className: 'leaflet-marker-photo'
			}, photo, this.options.icon)),
			title: photo.caption || ''
		});
		marker.photo = photo;
		return marker;
	}
});

L.photo = function (photos, options) {
	return new L.Photo(photos, options);
};

if (L.MarkerClusterGroup) {

	L.Photo.Cluster = L.MarkerClusterGroup.extend({
		options: {
			featureGroup: L.photo,
			maxClusterRadius: 100,
			showCoverageOnHover: false,
			iconCreateFunction: function(cluster) {
				return new L.DivIcon(L.extend({
					className: 'leaflet-marker-photo',
					html: '<img src="' + cluster.getAllChildMarkers()[0].photo.thumbnail + '" ' + (cluster.getAllChildMarkers()[0].photo.thumbnail2x!=='' ? 'srcset="' + cluster.getAllChildMarkers()[0].photo.thumbnail + ' 1x, ' + cluster.getAllChildMarkers()[0].photo.thumbnail2x + ' 2x"' : '' )+ '></img>​<b>' + cluster.getChildCount() + '</b>'
				}, this.icon));
		   	},
			icon: {
				iconSize: [40, 40]
			}
		},

		initialize: function (options) {
			options = L.Util.setOptions(this, options);
			L.MarkerClusterGroup.prototype.initialize.call(this);
			this._photos = options.featureGroup(null, options);
		},

		add: function (photos) {
			this.addLayer(this._photos.addLayers(photos));
			return this;
		},

		clear: function () {
			this._photos.clearLayers();
			this.clearLayers();
		}

	});

	L.photo.cluster = function (options) {
		return new L.Photo.Cluster(options);
	};

}
