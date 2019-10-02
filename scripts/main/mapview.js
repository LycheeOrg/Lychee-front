/**
 * @description This module takes care of the map view of a full album and its sub-albums.
 */

mapview = {
		map: null,
		photoLayer: null,
		min_lat: null,
		min_lng: null,
		max_lat: null,
		max_lng: null,
		albumID: null
};

mapview.isInitialized = function() {
	if(mapview.map===null || mapview.photoLayer===null) {
		return false;
	}
	return true;
}

// Open the map view
mapview.open = function(albumID = null) {

	// If map functionality is disabled -> do nothing
	if ((!lychee.map_display) || (lychee.publicMode===true && !lychee.map_display_public)) {
		loadingBar.show('error', lychee.locale['ERROR_MAP_DEACTIVATED']);
		return;
	}

	// In case function is called without albumID -> we take the ID
	// from the currently shown album
	if(albumID === null) {
		if (album.json !== null && album.json.photos !== null) {
			albumID = album.json.ID;
		} else {
			return;
		}
	}

	lychee.animate($('#mapview'), 'fadeIn');
	$('#mapview').show();
	header.setMode('map');

	mapview.albumID = albumID;

  // initialize container only once
	if(mapview.isInitialized()==false) {

		// Leaflet seaches for icon in same directoy as js file -> paths needs
		// to be overwritten
		delete L.Icon.Default.prototype._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'img/marker-icon-2x.png',
			iconUrl: 'img/marker-icon.png',
			shadowUrl: 'img/marker-shadow.png',
		});

		// Set initial view to (0,0)
		mapview.map = L.map('leaflet_map_full').setView([0.0, 0.0], 13);

		// Add plain OpenStreetMap Layer
		L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(mapview.map);

	} else {
		// Mapview has already shown data -> we need to clear it
		mapview.photoLayer.clear();

		// Reset min/max lat/lgn Values
		mapview.min_lat = null;
		mapview.max_lat = null;
		mapview.min_lng = null;
		mapview.max_lng = null;
	}

	// Define how the photos on the map should look like
	mapview.photoLayer = L.photo.cluster().on('click', function(e) {
			var photo = e.layer.photo;
			var template = "";
			template = template.concat('<img class="image-leaflet-popup" src="{url}" data-album-id="{albumID}" data-id="{photoID}"/><div><h1>{name}</h1><span title="Camera Date">', build.iconic("camera-slr"), '</span><p>{takedate}</p></div>');
			e.layer.bindPopup(L.Util.template(template, photo), {
					minWidth: 400
				}).openPopup();
	});


	// Adjusts zoom and position of map to show all images
	updateZoom = function() {
		if((mapview.min_lat)&&(mapview.min_lng)&&(mapview.max_lat)&&(mapview.max_lng)){
			var dist_lat = mapview.max_lat - mapview.min_lat;
			var dist_lng = mapview.max_lng - mapview.min_lng;
			mapview.map.fitBounds([[mapview.min_lat-0.1*dist_lat, mapview.min_lng-0.1*dist_lng], [mapview.max_lat+0.1*dist_lat, mapview.max_lng+0.1*dist_lng]]);
		} else {
			mapview.map.fitWorld();
		}
	}

	// Adds photos to the map
	addPhotosToMap = function(album) {

		// check if empty
		if(!album.photos) return;

		photos = [];

		album.photos.forEach(function (element, index) {
			if((element.latitude) || (element.longitude)) {
				photos.push({
					"lat": parseFloat(element.latitude),
					"lng": parseFloat(element.longitude),
					"thumbnail": element.thumbUrl,
					"url": element.small,
					"name": element.title,
					"takedate": element.takedate,
					"albumID": element.album,
					"photoID": element.id
				});

				// Update min/max lat/lng
				if((mapview.min_lat===null) || (mapview.min_lat>element.latitude)) {
					mapview.min_lat = parseFloat(element.latitude);
				}
				if((mapview.min_lng===null) || (mapview.min_lng>element.longitude)) {
					mapview.min_lng = parseFloat(element.longitude);
				}
				if((mapview.max_lat===null) || (mapview.max_lat<element.latitude)) {
					mapview.max_lat = parseFloat(element.latitude);
				}
				if((mapview.max_lng===null) || (mapview.max_lng<element.longitude)) {
					mapview.max_lng = parseFloat(element.longitude);
				}
			}
		});

		// Add Photos to map
		mapview.photoLayer.add(photos).addTo(mapview.map);

		// Update Zoom and Position
		updateZoom();
	}

	// Call backend, retrieve information of photos and display them
	// This function is called recursively to retrieve data for sub-albums
	// Possible enhancement could be to only have a single ajax call
	getAlbumData = function(_albumID, setTitle = false) {

		let params = {
			albumID: _albumID,
			password: ''
		};

		api.post('Album::get', params, function (data) {

			if (data === 'Warning: Wrong password!') {
				password.getDialog(_albumID, function () {

					params.password = password.value;

					api.post('Album::get', params, function (data) {
						addPhotosToMap(data);
						if (setTitle===true) {
							lychee.setTitle(data.title, false);
						}

						// We also want to display images of subalbums
						data.albums.forEach(function (element, index) {
							getAlbumData(element.id);
						});
					})
				})
			} else {
				addPhotosToMap(data);
				if (setTitle===true) {
					lychee.setTitle(data.title, false);
				}

				// We also want to display images of subalbums
				data.albums.forEach(function (element, index) {
					getAlbumData(element.id);
				});
			}
		});
	}

	// If the has already been loaded - we can reuse the date
	if (album.json !== null && album.json.photos !== null) {

		// We reuse the already loaded data
		addPhotosToMap(album.json);
		album.json.albums.forEach(function (element, index) {
			getAlbumData(element.id);
		});

	} else {

		// Nothing preloaded - we need to load everything
		getAlbumData(albumID, true);

	}

	// Update Zoom and Position once more (for empty map)
	updateZoom();
}

mapview.close = function() {

	// If map functionality is disabled -> do nothing
	if (!lychee.map_display) return;

	lychee.animate($('#mapview'), 'fadeOut');
	$('#mapview').hide();
	header.setMode('album');

}

mapview.toggle = function() {

	// If map functionality is disabled -> do nothing
	if (!lychee.map_display) return;

  if(visible.mapview()) {
		mapview.close();
	} else {
		mapview.open();
	}
	return true;

};

mapview.goto = function(elem) {

	// If map functionality is disabled -> do nothing
	if (!lychee.map_display) return;

	var photoID = elem.attr('data-id');
	var albumID = elem.attr('data-album-id');

	if( (album.json==null) ||  (albumID!==album.json.id)) {
		album.refresh();
	}

	lychee.goto(albumID + '/' + photoID);

};
