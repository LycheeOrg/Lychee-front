/**
 * @description Takes care of every action a photoeditor can handle and execute.
 */

photoeditor = {

};

photoeditor.rotate = function(photoID, direction) {

	var swapDims = function(d){
		let p = d.indexOf('x');
		if ( p !== -1 ){
			return d.substr(0, p) + "x" + d.substr(p+1);
		}
		return d;
	};

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
			let mr = "?"+Math.random();
			let sel_big = 'img#image';
			let sel_thumb = 'div[data-id='+photoID+'] > span > img';
			let sel_div = 'div[data-id='+photoID+']';
			$( sel_big ).prop('src', $( sel_big ).attr('src') + mr );
			$( sel_big ).prop('srcset', $( sel_big ).attr('src') );
			$( sel_thumb ).prop('src', $( sel_thumb ).attr('src') + mr );
			$( sel_thumb ).prop('srcset', $( sel_thumb ).attr('src') );
			var arrayLength = album.json.photos.length;
			for (var i = 0; i < arrayLength; i++) {
				if ( album.json.photos[i].id === photoID ){
					let w = album.json.photos[i].width;					
					let h = album.json.photos[i].height;					
					album.json.photos[i].height = w;
					album.json.photos[i].width = h;
					album.json.photos[i].small += mr;
					album.json.photos[i].small_dim = swapDims(album.json.photos[i].small_dim);
					album.json.photos[i].small2x += mr;
					album.json.photos[i].small2x_dim = swapDims(album.json.photos[i].small2x_dim);
					album.json.photos[i].medium += mr;
					album.json.photos[i].medium_dim = swapDims(album.json.photos[i].medium_dim);
					album.json.photos[i].medium2x += mr;
					album.json.photos[i].medium2x_dim = swapDims(album.json.photos[i].medium2x_dim);
					album.json.photos[i].thumb2x += mr;
					album.json.photos[i].thumbUrl += mr;
					album.json.photos[i].url += mr;
					view.album.content.justify();
					break;
				}
			}
		}

	})

};

