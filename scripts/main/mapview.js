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
		attribution: `&copy; <a href="https://osm.org/copyright">${lychee.locale["OSM_CONTRIBUTORS"]}</a>`,
	},
	/**
	 * @type {MapProvider}
	 */
	"OpenStreetMap.de": {
		layer: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png ",
		attribution: `&copy; <a href="https://osm.org/copyright">${lychee.locale["OSM_CONTRIBUTORS"]}</a>`,
	},
	/**
	 * @type {MapProvider}
	 */
	"OpenStreetMap.fr": {
		layer: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png ",
		attribution: `&copy; <a href="https://osm.org/copyright">${lychee.locale["OSM_CONTRIBUTORS"]}</a>`,
	},
	/**
	 * @type {MapProvider}
	 */
	RRZE: {
		layer: "https://{s}.osm.rrze.fau.de/osmhd/{z}/{x}/{y}.png",
		attribution: `&copy; <a href="https://osm.org/copyright">${lychee.locale["OSM_CONTRIBUTORS"]}</a>`,
	},
};

const mapview = {
	/** @type {?L.Map} */
	map: null,
	photoLayer: null,
	trackLayer: null,
	/** @type {(?LatLngBounds|?number[][])} */
	bounds: null,
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
			lychee.setMetaData(lychee.locale["STARRED"]);
			break;
		case SmartAlbumID.PUBLIC:
			lychee.setMetaData(lychee.locale["PUBLIC"]);
			break;
		case SmartAlbumID.RECENT:
			lychee.setMetaData(lychee.locale["RECENT"]);
			break;
		case SmartAlbumID.UNSORTED:
			lychee.setMetaData(lychee.locale["UNSORTED"]);
			break;
		case null:
			lychee.setMetaData(lychee.locale["ALBUMS"]);
			break;
		default:
			lychee.setMetaData(_albumTitle ? _albumTitle : lychee.locale["UNTITLED"]);
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

	const mapContainer = $("#lychee_map_container");
	lychee.animate(mapContainer, "fadeIn");
	mapContainer.addClass("active");
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
		mapview.map = L.map("lychee_map_container").setView([0.0, 0.0], 13);

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
			// Mapview has already shown data -> remove only photoLayer and trackLayer showing photos and tracks
			mapview.photoLayer.clear();
			if (mapview.trackLayer !== null) {
				mapview.map.removeLayer(mapview.trackLayer);
			}
		}

		// Reset bounds
		mapview.bounds = null;
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
				'data-album-id="{albumID}" data-id="{photoID}"/><div><h1>{name}</h1><span title="' + lychee.locale["CAMERA_DATE"] + '">',
				build.iconic("camera-slr"),
				"</span><p>{taken_at}</p></div>"
			);
		} else {
			template = template.concat(
				'<img class="image-leaflet-popup" src="{url}" ',
				'data-album-id="{albumID}" data-id="{photoID}"/><div><h1>{name}</h1><span title="' + lychee.locale["CAMERA_DATE"] + '">',
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
		if (mapview.bounds) {
			mapview.map.fitBounds(mapview.bounds);
		} else {
			mapview.map.fitWorld();
		}
	};

	/**
	 * Adds photos to the map.
	 *
	 * @param {(Album|TagAlbum|PositionData)} album
	 *
	 * @returns {void}
	 */
	const addContentsToMap = function (album) {
		// check if empty
		if (!album.photos) return;

		/** @type {MapPhotoEntry[]} */
		let photos = [];

		/** @type {?number} */
		let min_lat = null;
		/** @type {?number} */
		let min_lng = null;
		/** @type {?number} */
		let max_lat = null;
		/** @type {?number} */
		let max_lng = null;

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
					if (min_lat === null || min_lat > element.latitude) {
						min_lat = element.latitude;
					}
					if (min_lng === null || min_lng > element.longitude) {
						min_lng = element.longitude;
					}
					if (max_lat === null || max_lat < element.latitude) {
						max_lat = element.latitude;
					}
					if (max_lng === null || max_lng < element.longitude) {
						max_lng = element.longitude;
					}
				}
			}
		);

		// Add Photos to map
		mapview.photoLayer.add(photos).addTo(mapview.map);

		if (photos.length > 0) {
			// update map bounds
			const dist_lat = max_lat - min_lat;
			const dist_lng = max_lng - min_lng;
			mapview.bounds = [
				[min_lat - 0.1 * dist_lat, min_lng - 0.1 * dist_lng],
				[max_lat + 0.1 * dist_lat, max_lng + 0.1 * dist_lng],
			];
		}

		// add track
		if (album.track_url) {
			mapview.trackLayer = new L.GPX(album.track_url, {
				async: true,
				marker_options: {
					startIconUrl: null,
					endIconUrl: null,
					shadowUrl: null,
				},
			})
				.on("error", function (e) {
					lychee.error(lycche.locale["ERROR_GPX"] + e.err);
				})
				.on("loaded", function (e) {
					if (photos.length === 0) {
						// no photos, update map bound to center track
						mapview.bounds = e.target.getBounds();
						updateZoom();
					}
				});
			mapview.trackLayer.addTo(mapview.map);
		}

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
			addContentsToMap(data);
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
		addContentsToMap(album.json);
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

	const mapContainer = $("#lychee_map_container");
	lychee.animate(mapContainer, "fadeOut");
	// TODO: Reconsider the line below
	// The line below is inconsistent to the corresponding code for
	// the photo view (cp. `view.photo.hide()`).
	// Here, we remove the `active` class immediately, in `view.photo.hide()`
	// we remove that class after the animation has ended.
	mapContainer.removeClass("active");
	// TODO: Fix the line below
	// The map view can also be opened from a single photo and probably a
	// users expect to go back to the photo if they close the photo.
	// Currently, Lychee jumps back to the album of that photo.
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
