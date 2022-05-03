/**
 * @description This module takes care of the map view of a full album and its sub-albums.
 */

/**
 * @typedef MapProvider
 * @property {string} layer - URL pattern for map tile
 * @property {string} attribution - HTML with attribution
 */

const map_provider_layer_attribution = {
	/**
	 * @type {MapProvider}
	 */
	Wikimedia: {
		layer: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png",
		attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
	},
	/**
	 * @type {MapProvider}
	 */
	"OpenStreetMap.org": {
		layer: "https://{s}.tile.osm.org/{z}/{x}/{y}.png",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
	/**
	 * @type {MapProvider}
	 */
	"OpenStreetMap.de": {
		layer: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png ",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
	/**
	 * @type {MapProvider}
	 */
	"OpenStreetMap.fr": {
		layer: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png ",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
	/**
	 * @type {MapProvider}
	 */
	RRZE: {
		layer: "https://{s}.osm.rrze.fau.de/osmhd/{z}/{x}/{y}.png",
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
	},
};

const mapview = {
	/** @type {?L.Map} */
	map: null,
	photoLayer: null,
	/** @type {?number} */
	min_lat: null,
	/** @type {?number} */
	min_lng: null,
	/** @type {?number} */
	max_lat: null,
	/** @type {?number} */
	max_lng: null,
	/** @type {?string} */
	albumID: null,
	/** @type {?string} */
	map_provider: null,
};

/**
 * @typedef MapPhotoEntry
 *
 * @property {number} [lat] - latitude
 * @property {number} [lng] - longitude
 * @property {string} [thumbnail] - URL to the thumbnail
 * @property {string} [thumbnail2x] - URL to the high-res thumbnail
 * @property {string} url - URL to the small size-variant; quite a misnomer
 * @property {string} url2x - URL to the small, high-res size-variant; quite a misnomer
 * @property {string} name - the title of the photo
 * @property {string} taken_at - the takedate of the photo, formatted as a locale string
 * @property {string} albumID - the album ID
 * @property {string} photoID - the photo ID
 */

/**
 * @returns {boolean}
 */
mapview.isInitialized = function () {
	return !(mapview.map === null || mapview.photoLayer === null);
};

/**
 * @param {?string} _albumID
 * @param {string} _albumTitle
 *
 * @returns {void}
 */
mapview.title = function (_albumID, _albumTitle) {
	switch (_albumID) {
		case SmartAlbumID.STARRED:
			lychee.setTitle(lychee.locale["STARRED"], false);
			break;
		case SmartAlbumID.PUBLIC:
			lychee.setTitle(lychee.locale["PUBLIC"], false);
			break;
		case SmartAlbumID.RECENT:
			lychee.setTitle(lychee.locale["RECENT"], false);
			break;
		case SmartAlbumID.UNSORTED:
			lychee.setTitle(lychee.locale["UNSORTED"], false);
			break;
		case null:
			lychee.setTitle(lychee.locale["ALBUMS"], false);
			break;
		default:
			lychee.setTitle(_albumTitle ? _albumTitle : lychee.locale["UNTITLED"], false);
			break;
	}
};

/**
 * Opens the map view
 *
 * @param {?string} [albumID=null]
 * @returns {void}
 */
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
	if (!mapview.isInitialized()) {
		// Leaflet searches for icon in same directory as js file -> paths need
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
		/** @type {MapPhotoEntry} */
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
			const dist_lat = mapview.max_lat - mapview.min_lat;
			const dist_lng = mapview.max_lng - mapview.min_lng;
			mapview.map.fitBounds([
				[mapview.min_lat - 0.1 * dist_lat, mapview.min_lng - 0.1 * dist_lng],
				[mapview.max_lat + 0.1 * dist_lat, mapview.max_lng + 0.1 * dist_lng],
			]);
		} else {
			mapview.map.fitWorld();
		}
	};

	/**
	 * Adds photos to the map.
	 *
	 * @param {(Album|TagAlbum|PositionData)} album
	 */
	const addPhotosToMap = function (album) {
		// check if empty
		if (!album.photos) return;

		/** @type {MapPhotoEntry[]} */
		let photos = [];

		album.photos.forEach(
			/** @param {Photo} element */ function (element) {
				if (element.latitude || element.longitude) {
					photos.push({
						lat: element.latitude,
						lng: element.longitude,
						thumbnail: element.size_variants.thumb !== null ? element.size_variants.thumb.url : "img/placeholder.png",
						thumbnail2x: element.size_variants.thumb2x !== null ? element.size_variants.thumb2x.url : null,
						url: element.size_variants.small !== null ? element.size_variants.small.url : element.url,
						url2x: element.size_variants.small2x !== null ? element.size_variants.small2x.url : null,
						name: element.title,
						taken_at: element.taken_at,
						albumID: element.album_id,
						photoID: element.id,
					});

					// Update min/max lat/lng
					if (mapview.min_lat === null || mapview.min_lat > element.latitude) {
						mapview.min_lat = element.latitude;
					}
					if (mapview.min_lng === null || mapview.min_lng > element.longitude) {
						mapview.min_lng = element.longitude;
					}
					if (mapview.max_lat === null || mapview.max_lat < element.latitude) {
						mapview.max_lat = element.latitude;
					}
					if (mapview.max_lng === null || mapview.max_lng < element.longitude) {
						mapview.max_lng = element.longitude;
					}
				}
			}
		);

		// Add Photos to map
		mapview.photoLayer.add(photos).addTo(mapview.map);

		// Update Zoom and Position
		updateZoom();
	};

	/**
	 * Calls backend, retrieves information about photos and displays them.
	 *
	 * This function is called recursively to retrieve data for sub-albums.
	 * Possible enhancement could be to only have a single ajax call.
	 *
	 * @param {?string} _albumID
	 * @param {boolean} [_includeSubAlbums=true]
	 */
	const getAlbumData = function (_albumID, _includeSubAlbums = true) {
		/**
		 * @param {PositionData} data
		 */
		const successHandler = function (data) {
			addPhotosToMap(data);
			mapview.title(_albumID, data.title);
		};

		if (_albumID !== "" && _albumID !== null) {
			// _albumID has been specified
			const params = {
				albumID: _albumID,
				includeSubAlbums: _includeSubAlbums,
			};

			api.post("Album::getPositionData", params, successHandler);
		} else {
			// AlbumID is empty -> fetch all photos of all albums
			api.post("Albums::getPositionData", {}, successHandler);
		}
	};

	// If sub-albums are not requested and album.json already has all data,
	// we reuse it
	if (lychee.map_include_subalbums === false && album.json !== null && album.json.photos !== null) {
		addPhotosToMap(album.json);
	} else {
		// Not all needed data has been  preloaded - we need to load everything
		getAlbumData(albumID, lychee.map_include_subalbums);
	}

	// Update Zoom and Position once more (for empty map)
	updateZoom();
};

/**
 * @returns {void}
 */
mapview.close = function () {
	// If map functionality is disabled -> do nothing
	if (!lychee.map_display) return;

	lychee.animate($("#mapview"), "fadeOut");
	$("#mapview").hide();
	header.setMode("album");

	// Make album focusable
	tabindex.makeFocusable(lychee.content);
};

/**
 * @param {jQuery} elem
 * @returns {void}
 */
mapview.goto = function (elem) {
	// If map functionality is disabled -> do nothing
	if (!lychee.map_display) return;

	const photoID = elem.attr("data-id");
	let albumID = elem.attr("data-album-id");

	if (albumID === "null") albumID = "unsorted";

	lychee.goto(albumID + "/" + photoID);
};
