/**
 * @description Takes care of every action a photoeditor can handle and execute.
 */

photoeditor = {

};

photoeditor.rotate = function(photoID, direction) {

	if (!photoID) return false;
	if (!direction) return false;

	let params = {
		photoID: photoID,
		direction: direction
	};

	api.post('PhotoEditor::rotate', params, function(data) {

		if (data!==true) {
			lychee.error(null, params, data)
		} else {
			let sel_big = 'img#image';
			let sel_thumb = 'div[data-id='+photoID+'] > span > img';
			let sel_div = 'div[data-id='+photoID+']';
			$( sel_big ).prop('src', $( sel_big ).attr('src') + '?v=' + Math.random() );
			$( sel_big ).prop('srcset', $( sel_big ).attr('src') );
			$( sel_thumb ).prop('src', $( sel_thumb ).attr('src') + '?v=' + Math.random() );
			$( sel_thumb ).prop('srcset', $( sel_thumb ).attr('src') );
			let div_w = $( sel_div ).width();
			let div_h = $( sel_div ).height();
			$( sel_div ).width( div_h );
			$( sel_div ).height( div_w );
		//	view.album.content.justify();
		}

	})

};

