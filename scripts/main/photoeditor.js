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
		if (data === false) {
			lychee.error(null, params, data);
		} else {
			photo.json = data;
			photo.json.original_album = photo.json.album;
			if (album.json) {
				photo.json.album = album.json.id;
			}

			image = $("img#image");
			if (photo.json.hasOwnProperty("medium2x") && photo.json.medium2x !== "") {
				image.prop(
					"srcset",
					`${photo.json.medium} ${parseInt(photo.json.medium_dim, 10)}w, ${photo.json.medium2x} ${parseInt(photo.json.medium2x_dim, 10)}w`
				);
			} else {
				image.prop("srcset", "");
			}
			image.prop("src", photo.json.medium !== "" ? photo.json.medium : photo.json.url);
			view.photo.onresize();
			view.photo.sidebar();

			album.updatePhoto(data);
		}
	});
};
