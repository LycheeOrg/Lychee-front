/**
 * @description Takes care of every action a photoeditor can handle and execute.
 */

photoeditor = {};

photoeditor.rotate = function (photoID, direction) {
	if (!photoID) return false;
	if (!direction) return false;

	let params = {
		photoID: photoID,
		direction: direction,
	};

	api.post("PhotoEditor::rotate", params, function (data) {
		photo.json = data;
		photo.json.original_album_id = photo.json.album_id;
		if (album.json) {
			photo.json.album_id = album.json.id;
		}

		let image = $("img#image");
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
	});
};
