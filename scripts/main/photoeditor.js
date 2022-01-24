/**
 * @description Takes care of every action a photoeditor can handle and execute.
 */

photoeditor = {};

/**
 * @param {string} photoID
 * @param {number} direction - either `1` or `-1`
 * @returns {void}
 */
photoeditor.rotate = function (photoID, direction) {
	api.post(
		"PhotoEditor::rotate", {
			photoID: photoID,
			direction: direction,
		},
		/** @param {Photo} data */
		function (data) {
			photo.json = data;
			// TODO: `photo.json.original_album_id` is set only, but never read; do we need it?
			photo.json.original_album_id = photo.json.album_id;
			if (album.json) {
				// TODO: Why do we overwrite the true album ID of a photo, by the externally provided one? I guess we need it, because the album which the user came from might also be a smart album or a tag album. However, in this case I would prefer to leave the `album_id  untouched (don't rename it to `original_album_id`) and call this one `effective_album_id` instead.
				photo.json.album_id = album.json.id;
			}

			const image = $("img#image");
			if (photo.json.size_variants.medium2x !== null) {
				image.prop(
					"srcset",
					`${photo.json.size_variants.medium.url} ${photo.json.size_variants.medium.width}w, ${photo.json.size_variants.medium2x.url} ${photo.json.size_variants.medium2x.width}w`
				);
			} else {
				image.prop("srcset", "");
			}
			image.prop("src", photo.json.size_variants.medium !== null ? photo.json.size_variants.medium.url : photo.json.size_variants.original.url);
			view.photo.onresize();
			view.photo.sidebar();
			album.updatePhoto(data);
		}
	);
};
