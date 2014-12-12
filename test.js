$( document ).ready(function () {
	var videoOnScreen = false;
	var pod = crosscloud.connect();
	var playlists = $("#playlists");
	var newPlaylistName = $('#playlist-name');
	var createPlaylistBox = $('#new-playlist-box');
	var createPlaylistButton = $('#create-playlist');
	var searchSongs = $('#search-song-box');
	var addSongBtn = $('#search-song');
	// pod.push({isPlaylist: true,
	// 	name: "good playlist",
	// 	songs: [
	// 		"/dataworld/freeq/job_faba88ac-9001-4807-adc4-81843882b643_var_mb_ngs$003Arecording_recording_gid_2c805ab0-6796-4269-b96f-8265f4a2fb8f"
	// 	]
	// });
	// pod.onLogin(getPlaylists());
	// pod.push({
	// 	_id: 'http://playlists.fakepods.com/r13',
	// 	songs: [
	// 		'/dataworld/freeq/job_faba88ac-9001-4807-adc4-81843882b643_var_mb_ngs$003Arecording_recording_gid_2c805ab0-6796-4269-b96f-8265f4a2fb8f',
	// 		'/m/0122029'
	// 	]
	// });
	getPlaylists();
	// console.log(getPlaylists());
	var songs = $("#songs");
	var title = $('#title');
	// console.log(pod);
	title.click(function() {
		if(videoOnScreen) {
			$('#ytplayer').toggleClass('hidden');
		}
		playlists.toggleClass('hidden');
		createPlaylistBox.toggleClass('hidden');
		songs.toggleClass('hidden');
		searchSongs.toggleClass('hidden');
		title.text('My Playlists');
		getPlaylists();
	});

	createPlaylistButton.click(function() {
		pod.push({
			isPlaylist: true,
			name: newPlaylistName.val(),
			songs:[]
		});
	});

	addSongBtn.click(function() {
		console.log("addsongbtn clicked");
		var songsAlreadyInPlaylist = [];
		if (songs.children().length > 0) {
			console.log(songs.children().length);
			for (var i=0; i<songs.children().length; i++) {
				console.log(songs.children()[i].getAttribute('id'));
				songsAlreadyInPlaylist.push(songs.children()[i].getAttribute('id'));
			}
		}
		var songName = $("#song-name").val();
		var artistName = $('#song-artist').val();
		$('#song-name').val('');
		$('#song-artist').val('');
		var query = [{"type":"/music/recording","id":null,"name":songName,"artist":artistName}];
		var service_url = 'https://www.googleapis.com/freebase/v1/mqlread';
		// songs.empty();
		$.getJSON(service_url + '?callback=?', {query:JSON.stringify(query),key:'AIzaSyASiSl8UuN0g4qvFma54isfk9FqPtDIYTE'}, function(response) {
			console.log(response);
			songsAlreadyInPlaylist.push(response.result[0].id);
			// $('<div>',{text:response.result[0].name + " by " + response.result[0].artist, id: response.result[0].id}).appendTo(songs);
			songs.empty();
			console.log(songsAlreadyInPlaylist);
			pod.push({
				_id: searchSongs.data('playlist-id'),
				songs: songsAlreadyInPlaylist
			});
		});
		// console.log(searchSongs.data('playlist-id'));
		// console.log(songsAlreadyInPlaylist);
	});

	function getPlaylists() {
		console.log("getPlaylists called");
		// pod.query().pattern({isPlaylist: true});
		pod.query()
			.filter({
				_owner: "http://eugene.fakepods.com",
				isPlaylist: true
			})
			.onAllResults(function(items) {
				console.log(items);
				playlists.empty();
				items.forEach(function(item) {
					addPlaylist(item);
				});
			})
			.start();
	}

	function addPlaylist(item) {
		var div = $('<li>', {text: item.name, id: item._id, class:"list-group-item"});
		div.click(function() {
			// console.log($(this).attr('id'));
			if (searchSongs.data('playlist-id') == $(this).attr('id')) {
				console.log('same playlist id');
				title.text($(this).text());
				searchSongs.toggleClass('hidden');
				createPlaylistBox.toggleClass('hidden');
				playlists.toggleClass('hidden');
				songs.toggleClass('hidden');
			}
			else{
				console.log('different playlist id');
				console.log($(this).attr('id'));
				title.text($(this).text());
				searchSongs.toggleClass('hidden');
				createPlaylistBox.toggleClass('hidden');
				playlists.toggleClass('hidden');
				songs.toggleClass('hidden');
				searchSongs.data('playlist-id', $(this).attr('id'));
				pod.query()
					.filter({_id: $(this).attr('id')})
					.onAllResults(function(items) {
						console.log(items);
						songs.empty();
						displaySongsInPlaylist(items[0]);
						// cons
						console.log(items);
					}).start();
			}
			
		});
		div.appendTo(playlists);
	}

	function displaySongsInPlaylist(item) {
		console.log(item);
		for (i in item.songs) {
			console.log(item.songs[i]);
			searchSong(item.songs[i]);
		}
	}

	function searchSong(songId) {
		var query = [{"type":"/music/recording","id":songId,"name":null,"artist":null}];
		var service_url = 'https://www.googleapis.com/freebase/v1/mqlread';
		$.getJSON(service_url + '?callback=?', {query:JSON.stringify(query),key:'AIzaSyASiSl8UuN0g4qvFma54isfk9FqPtDIYTE'}, function(response) {
			$.each(response.result, function(i, song){
				console.log(song.artist);
				var newItem = $('<li>',{text:song.name + " by " + song.artist, id: song.id, class:"list-group-item"});
				newItem.click(function() {
					if (!videoOnScreen) {
						$('#ytplayer').toggleClass('hidden');
					}
				});
				newItem.appendTo(songs);
			});
		});
	}
	// var query = [{"id":null, "type":"/music/artist", "name":'Britney Spears'}];
	// 	var service_url = 'https://www.googleapis.com/freebase/v1/mqlread';
	// 	$.getJSON(service_url + '?callback=?', {query:JSON.stringify(query)}, function(response) {
	// 		$.each(response.result, function(i,artist){
	// 			console.log(artist);
	// 			$('<div>',{text:artist.name}).appendTo(document.body);
 //        });
	// });
});