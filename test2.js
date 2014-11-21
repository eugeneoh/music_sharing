		var query = [{"type":"/music/recording","id":null,"name":'Lose Yourself', 'artist':'Eminem'}];
		var service_url = 'https://www.googleapis.com/freebase/v1/mqlread';
		// songs.empty();
		$.getJSON(service_url + '?callback=?', {query:JSON.stringify(query)}, function(response) {
			console.log(response.result);
			// var result = response.result[1];
			// $.getJSON(service_url + '?callback=?', {query:JSON.stringify([{'type':'/music/recording','id':result.id,'name':null,'artist':null}])}, function(response) {
			// 	$.each(response.result, function(i,song){
			// 		console.log(song);
			// 		$('<div>',{text:song.name + " by " + song.artist, id: songs.id}).appendTo($('#playlists'));
			// 	});
			// });
		});