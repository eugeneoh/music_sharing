$(document).ready(function() {
	var pod = crosscloud.connect();
	var playlists = $("#playlists");
	var newPlaylistName = $('#playlist-name');
	var createPlaylistBox = $('#new-playlist-box');
	var createPlaylistButton = $('#create-playlist');
	var searchSongs = $('#search-song-box');
	var searchSongBtn = $('#search-song');
	var searchResults = $('#search-results-list');
	var shuffleBtn = $('#shuffle-songs');
	var queueList = $('#queue-list');
	var ytAPIkey = 'AIzaSyDWuJQ9I7VNlCE1GMswlE0xzqDZgWbzW-E';
	var YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/';
	var currentPlaylistSongs = [];
	var playQueue = [];
	var currentID = '';
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
	pod.onLogin(function(userID) {
		currentID = userID;
		getPlaylists();
	});

	// console.log(getPlaylists());
	var songs = $("#songs");
	var title = $('#title');
	var player;
	// console.log(pod);
	window.onYouTubeIframeAPIReady = function() {
		//console.log('youtube api ready');
		player = new YT.Player('ytplayer', {
			height: '366',
			width: '600',
			// videoId: 'e-ORhEE9VVg',
			playerVars: {
				autoplay: 0,
				html5: 1
			},
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});

		function onPlayerReady(e) {
			console.log('player is ready');
		}

		function onPlayerStateChange(e) {
			console.log('player state has changed');
			if (e.data === YT.PlayerState.ENDED) {
				if (playQueue.length > 0) {
					player.loadVideoById(playQueue.shift().videoId);
					queueList.children()[0].remove();
				}
			}
		}
	};
	title.click(function() {
		playlists.toggleClass('hidden');
		createPlaylistBox.toggleClass('hidden');
		songs.toggleClass('hidden');
		searchSongs.toggleClass('hidden');
		title.text('My Playlists');
	});

	createPlaylistButton.click(function() {
		pod.push({
			isPlaylist: true,
			name: newPlaylistName.val(),
			canEdit: [currentID],
			canView: [currentID],
			songs: []
		});
	});

	searchSongBtn.click(function() {
		var songName = $("#song-name").val();
		var artistName = $('#song-artist').val();
		$('#song-name').val('');
		$('#song-artist').val('');
		searchSong(songName + ' ' + artistName);

		// console.log(searchSongs.data('playlist-id'));
		// console.log(songsAlreadyInPlaylist);
	});

	shuffleBtn.click(function() {
		initializePlayQueue();
		shuffle(playQueue);
		queueList.empty();
		for (s in playQueue) {
			var queueListCtn = $('<li>');
			var queueListItem = $('<a>', {
				text: playQueue[s].name,
				id: playQueue[s].videoId
			});
			queueListCtn.append(queueListItem);
			queueListCtn.appendTo(queueList);
		}
		player.loadVideoById(playQueue.shift().videoId);
	});

	function getPlaylists() {
		pod.query()
			.filter({
				isPlaylist: true
			})
			.onAllResults(function(items) {
				playlists.empty();
				items.forEach(function(item) {
					if (item.canView) {
						if (item.canView.indexOf(currentID) > -1) {
							addPlaylist(item);
						}
					}

				});
			})
			.start();
	}

	function addPlaylist(item) {
		console.log(item);
		var div = $('<li>', {
			text: item.name,
			id: item._id,
			class: "list-group-item"
		});
		div.click(function() {
			// console.log($(this).attr('id'));
			// if (searchSongs.data('playlist-id') == $(this).attr('id')) {
			// 	console.log('same playlist id');
			// 	title.text($(this).text());
			// 	searchSongs.toggleClass('hidden');
			// 	createPlaylistBox.toggleClass('hidden');
			// 	playlists.toggleClass('hidden');
			// 	songs.toggleClass('hidden');
			// } else {
			// 	window.location.href = './views/playlist';
			// 	songs.empty();
			// 	queueList.empty();
			// 	console.log('different playlist id');
			// 	console.log($(this).attr('id'));
				window.location.href = './views/playlist?id='+$(this).attr('id');
			// 	title.text($(this).text());
			// 	searchSongs.toggleClass('hidden');
			// 	createPlaylistBox.toggleClass('hidden');
			// 	playlists.toggleClass('hidden');
			// 	songs.toggleClass('hidden');
			// 	searchSongs.data('playlist-id', $(this).attr('id'));
			// 	pod.query()
			// 		.filter({
			// 			_id: $(this).attr('id')
			// 		})
			// 		.onAllResults(function(items) {
			// 			displaySongsInPlaylist(items[0]);
			// 		}).start();
			// }

		});
		div.appendTo(playlists);
	}

	function shuffle(array) {
		var currentIndex = array.length,
			temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	function initializePlayQueue() {
			playQueue = [];
			for (var i = 0; i < currentPlaylistSongs.length; i++) {
				playQueue.push(currentPlaylistSongs[i]);
			}
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