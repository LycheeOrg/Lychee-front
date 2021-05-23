/**
 * @description This module takes care of the map view of a full album and its sub-albums.
 */

const map_provider_layer_attribution = {
	Wikimedia: {
		layer: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png",
		attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
	},
	"OpenStreetMap.org": {
		layer: "https://{s}.tile.osm.org/{z}/{x}/{y}.png",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
	"OpenStreetMap.de": {
		layer: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png ",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
	"OpenStreetMap.fr": {
		layer: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png ",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
	RRZE: {
		layer: "https://{s}.osm.rrze.fau.de/osmhd/{z}/{x}/{y}.png",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
};

let mapview = {
	map: null,
	photoLayer: null,
	min_lat: null,
	min_lng: null,
	max_lat: null,
	max_lng: null,
	albumID: null,
	map_provider: null,
};

mapview.isInitialized = function () {
	if (mapview.map === null || mapview.photoLayer === null) {
		return false;
	}
	return true;
};

mapview.title = function (_albumID, _albumTitle) {
	switch (_albumID) {
		case "f":
			lychee.setTitle(lychee.locale["STARRED"], false);
			break;
		case "s":
			lychee.setTitle(lychee.locale["PUBLIC"], false);
			break;
		case "r":
			lychee.setTitle(lychee.locale["RECENT"], false);
			break;
		case "0":
			lychee.setTitle(lychee.locale["UNSORTED"], false);
			break;
		case null:
			lychee.setTitle(lychee.locale["ALBUMS"], false);
			break;
		default:
			lychee.setTitle(_albumTitle, false);
			break;
	}
};

// Open the map view
mapview.open = function (albumID = null) {
	// If map functionality is disabled -> do nothing
	if (!lychee.map_display || (lychee.publicMode === true && !lychee.map_display_public)) {
		loadingBar.show("error", lychee.locale["ERROR_MAP_DEACTIVATED"]);
		return;
	}

	lychee.animate($("#mapview"), "fadeIn");
	$("#mapview").show();
	header.setMode("map");

	mapview.albumID = albumID;

	// initialize container only once
	if (mapview.isInitialized() == false) {
		// Leaflet seaches for icon in same directoy as js file -> paths needs
		// to be overwritten
		delete L.Icon.Default.prototype._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: "img/marker-icon-2x.png",
			iconUrl: "img/marker-icon.png",
			shadowUrl: "img/marker-shadow.png",
		});

		// Set initial view to (0,0)
		mapview.map = L.map("leaflet_map_full").setView([0.0, 0.0], 13);

		L.tileLayer(map_provider_layer_attribution[lychee.map_provider].layer, {
			attribution: map_provider_layer_attribution[lychee.map_provider].attribution,
		}).addTo(mapview.map);

		mapview.map_provider = lychee.map_provider;
	} else {
		if (mapview.map_provider !== lychee.map_provider) {
			// removew all layers
			mapview.map.eachLayer(function (layer) {
				mapview.map.removeLayer(layer);
			});

			L.tileLayer(map_provider_layer_attribution[lychee.map_provider].layer, {
				attribution: map_provider_layer_attribution[lychee.map_provider].attribution,
			}).addTo(mapview.map);

			mapview.map_provider = lychee.map_provider;
		} else {
			// Mapview has already shown data -> remove only photoLayer showing photos
			mapview.photoLayer.clear();
		}

		// Reset min/max lat/lgn Values
		mapview.min_lat = null;
		mapview.max_lat = null;
		mapview.min_lng = null;
		mapview.max_lng = null;
	}

	// Define how the photos on the map should look like
	mapview.photoLayer = L.photo.cluster().on("click", function (e) {
		const photo = {
			photoID: e.layer.photo.photoID,
			albumID: e.layer.photo.albumID,
			name: e.layer.photo.name,
			url: e.layer.photo.url,
			url2x: e.layer.photo.url2x,
			taken_at: lychee.locale.printDateTime(e.layer.photo.taken_at),
		};
		let template = "";

		// Retina version if available
		if (photo.url2x !== "") {
			template = template.concat(
				'<img class="image-leaflet-popup" src="{url}" ',
				'srcset="{url} 1x, {url2x} 2x" ',
				'data-album-id="{albumID}" data-id="{photoID}"/><div><h1>{name}</h1><span title="Camera Date">',
				build.iconic("camera-slr"),
				"</span><p>{taken_at}</p></div>"
			);
		} else {
			template = template.concat(
				'<img class="image-leaflet-popup" src="{url}" ',
				'data-album-id="{albumID}" data-id="{photoID}"/><div><h1>{name}</h1><span title="Camera Date">',
				build.iconic("camera-slr"),
				"</span><p>{taken_at}</p></div>"
			);
		}

		e.layer
			.bindPopup(L.Util.template(template, photo), {
				minWidth: 400,
			})
			.openPopup();
	});

	// Adjusts zoom and position of map to show all images
	const updateZoom = function () {
		if (mapview.min_lat && mapview.min_lng && mapview.max_lat && mapview.max_lng) {
			var dist_lat = mapview.max_lat - mapview.min_lat;
			var dist_lng = mapview.max_lng - mapview.min_lng;
			mapview.map.fitBounds([
				[mapview.min_lat - 0.1 * dist_lat, mapview.min_lng - 0.1 * dist_lng],
				[mapview.max_lat + 0.1 * dist_lat, mapview.max_lng + 0.1 * dist_lng],
			]);
		} else {
			mapview.map.fitWorld();
		}
	};

	// Adds photos to the map
	const addPhotosToMap = function (album) {
		// check if empty
		if (!album.photos) return;

		let photos = [];

		album.photos.forEach(function (element, index) {
			if (element.latitude || element.longitude) {
				photos.push({
					lat: parseFloat(element.latitude),
					lng: parseFloat(element.longitude),
					thumbnail: element.sizeVariants.thumb !== null ? element.sizeVariants.thumb.url : "img/placeholder.png",
					thumbnail2x: element.sizeVariants.thumb2x !== null ? element.sizeVariants.thumb2x.url : null,
					url: element.sizeVariants.small !== null ? element.sizeVariants.small.url : element.url,
					url2x: element.sizeVariants.small2x !== null ? element.sizeVariants.small2x.url : null,
					name: element.title,
					taken_at: element.taken_at,
					albumID: element.album,
					photoID: element.id,
				});

				// Update min/max lat/lng
				if (mapview.min_lat === null || mapview.min_lat > element.latitude) {
					mapview.min_lat = parseFloat(element.latitude);
				}
				if (mapview.min_lng === null || mapview.min_lng > element.longitude) {
					mapview.min_lng = parseFloat(element.longitude);
				}
				if (mapview.max_lat === null || mapview.max_lat < element.latitude) {
					mapview.max_lat = parseFloat(element.latitude);
				}
				if (mapview.max_lng === null || mapview.max_lng < element.longitude) {
					mapview.max_lng = parseFloat(element.longitude);
				}
			}
		});

		// Add Photos to map
		mapview.photoLayer.add(photos).addTo(mapview.map);

		// Update Zoom and Position
		updateZoom();
	};

	// Call backend, retrieve information of photos and display them
	// This function is called recursively to retrieve data for sub-albums
	// Possible enhancement could be to only have a single ajax call
	const getAlbumData = function (_albumID, _includeSubAlbums = true) {
		if (_albumID !== "" && _albumID !== null) {
			// _ablumID has been to a specific album
			let params = {
				albumID: _albumID,
				includeSubAlbums: _includeSubAlbums,
				password: "",
			};

			api.post("Album::getPositionData", params, function (data) {
				if (data === "Warning: Wrong password!") {
					password.getDialog(_albumID, function () {
						params.password = password.value;

						api.post("Album::getPositionData", params, function (_data) {
							addPhotosToMap(_data);
							mapview.title(_albumID, _data.title);
						});
					});
				} else {
					addPhotosToMap(data);
					mapview.title(_albumID, data.title);
				}
			});
		} else {
			// AlbumID is empty -> fetch all photos of all albums
			// _ablumID has been to a specific album
			let params = {
				includeSubAlbums: _includeSubAlbums,
				password: "",
			};

			api.post("Albums::getPositionData", params, function (data) {
				if (data === "Warning: Wrong password!") {
					password.getDialog(_albumID, function () {
						params.password = password.value;

						api.post("Albums::getPositionData", params, function (_data) {
							addPhotosToMap(_data);
							mapview.title(_albumID, _data.title);
						});
					});
				} else {
					addPhotosToMap(data);
					mapview.title(_albumID, data.title);
				}
			});
		}
	};

	// If subalbums not being included and album.json already has all data
	// -> we can reuse it
	if (lychee.map_include_subalbums === false && album.json !== null && album.json.photos !== null) {
		addPhotosToMap(album.json);
	} else {
		// Not all needed data has been  preloaded - we need to load everything
		getAlbumData(albumID, lychee.map_include_subalbums);
	}

	// Update Zoom and Position once more (for empty map)
	updateZoom();
};

mapview.close = function () {
	// If map functionality is disabled -> do nothing
	if (!lychee.map_display) return;

	lychee.animate($("#mapview"), "fadeOut");
	$("#mapview").hide();
	header.setMode("album");

	// Make album focussable
	tabindex.makeFocusable(lychee.content);
};

mapview.goto = function (elem) {
	// If map functionality is disabled -> do nothing
	if (!lychee.map_display) return;

	var photoID = elem.attr("data-id");
	var albumID = elem.attr("data-album-id");

	if (albumID == "null") albumID = 0;

	if (album.json == null || albumID !== album.json.id) {
		album.refresh();
	}

	lychee.goto(albumID + "/" + photoID);
};
