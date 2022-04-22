/**
 * drag album to another one
 * @param {DragEvent} ev
 */
function startAlbumDrag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

/**
 * drop album
 * @param {DragEvent} ev
 */
function dropAlbum(ev) {
	ev.preventDefault();
	if (album.isSmartID(ev.target.id.substring(6))) return;

	/** @type string */
	const data = ev.dataTransfer.getData("text");

	if (data.startsWith("photo-")) {
		// photo is dragged
		console.log(data.substring(6));
		console.log(ev.target.id.substring(6));
		contextMenu.photoDrop(data.substring(6), ev.target.id.substring(6), ev);
	} else {
		// album is dragged
		contextMenu.albumDrop(ev.target.id.substring(6), data.substring(6), ev);
	}
}
