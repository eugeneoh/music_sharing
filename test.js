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
		console.log("getPlaylists called");
		pod.query()
			.filter({
				_owner: "http://music.fakepods.com",
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
		var div = $('<li>', {
			text: item.name,
			id: item._id,
			class: "list-group-item"
		});
		div.click(function() {
			// console.log($(this).attr('id'));
			if (searchSongs.data('playlist-id') == $(this).attr('id')) {
				console.log('same playlist id');
				title.text($(this).text());
				searchSongs.toggleClass('hidden');
				createPlaylistBox.toggleClass('hidden');
				playlists.toggleClass('hidden');
				songs.toggleClass('hidden');
			} else {
				songs.empty();
				queueList.empty();
				console.log('different playlist id');
				console.log($(this).attr('id'));
				title.text($(this).text());
				searchSongs.toggleClass('hidden');
				createPlaylistBox.toggleClass('hidden');
				playlists.toggleClass('hidden');
				songs.toggleClass('hidden');
				searchSongs.data('playlist-id', $(this).attr('id'));
				pod.query()
					.filter({
						_id: $(this).attr('id')
					})
					.onAllResults(function(items) {
						displaySongsInPlaylist(items[0]);
					}).start();
			}

		});
		div.appendTo(playlists);
	}

	function displaySongsInPlaylist(item) {
		songs.empty();
		currentPlaylistSongs = item.songs;
		console.log(currentPlaylistSongs);
		for (i in currentPlaylistSongs) {
			var song = currentPlaylistSongs[i];
			var songListItem = $('<li>', {
				text: song.name,
				id: song.videoId,
				class: "list-group-item"
			});
			songListItem.data('song-order-number', i);
			playQueue.push(song);
			songListItem.click(function(e) {
				queueList.empty();
				initializePlayQueue();
				player.loadVideoById(e.target.id);
				// playQueue.shift();
				var tmp = [];
				for (var i = 0; i < $(e.target).data('song-order-number'); i++) {
					tmp.push(playQueue.shift());
				}
				console.log('tmp is: ', tmp);
				for (var j = 0; j < tmp.length; j++) {
					playQueue.push(tmp[j]);
				}
				for (var z = 0; z < playQueue.length; z++) {
					var queueListCtn = $('<li>');
					var queueListItem = $('<a>', {
						text: playQueue[z].name,
						id: playQueue[z].videoId
					});
					queueListCtn.data('song-queue-number', z);
					queueListCtn.click(function(e) {
						songQueueNumber = $(e.target).data('song-queue-number');
						console.log($(e.target));
						console.log(songQueueNumber);
						player.loadVideoById(playQueue[songQueueNumber].id);
						playQueue = playQueue.splice(songQueueNumber);
						$(queueList.children()[songQueueNumber]).remove();
					});
					queueListCtn.append(queueListItem);
					queueListCtn.appendTo(queueList);
				}
				console.log('playQueue is: ', playQueue);
			});
			songListItem.appendTo(songs);
		}
		// for (z in playQueue) {
		// 	var queueListCtn = $('<li>');
		// 	var queueListItem = $('<a>', {
		// 		text: playQueue[z].name,
		// 		id: playQueue[z].videoId
		// 	});
		// 	queueListCtn.click(function(e) {

		// 	});
		// 	queueListCtn.append(queueListItem);
		// 	queueListCtn.appendTo(queueList);
		// }
	}

	function searchSong(text) {
		var search_url = YOUTUBE_BASE_URL + 'search?part=snippet&type=video&maxResults=15&order=viewCount';
		search_url = search_url + '&key=' + ytAPIkey + '&q="' + text + '"';
		$.get(search_url).
		success(function(data) {
			var resultArray = data.items;
			console.log(resultArray);
			if (resultArray.length === 0) {
				searchResults.text('No results found');
			} else {
				for (var i = 0; i < resultArray.length; i++) {
					var searchResultItem = $('<div>', {
						class: "song-search-result"
					});
					var searchResultTitle = $('<span>', {
						text: resultArray[i].snippet.title
					});
					searchResultItem.append(searchResultTitle);
					var addSongBtnCtn = $('<span>', {
						class: 'align-right'
					});
					var addSongBtn = $('<span>', {
						class: 'glyphicon glyphicon-plus',
						id: resultArray[i].snippet.title
					});
					addSongBtn.data('videoId', resultArray[i].id.videoId);
					addSongBtn.click(function(e) {
						var playlistID = searchSongs.data('playlist-id');
						var tmp = {
							name: e.target.id,
							videoId: $(e.target).data('videoId')
						}
						currentPlaylistSongs.push(tmp);
						playQueue.push(tmp);
						console.log(currentPlaylistSongs);
						console.log(playlistID);
						pod.push({
							_id: playlistID,
							songs: currentPlaylistSongs
						});
					});
					addSongBtnCtn.append(addSongBtn);
					searchResultItem.append(addSongBtnCtn);
					// searchResultItem.append($('<img>', {src: resultArray[i].snippet.thumbnails.default.url}));

					searchResultItem.appendTo(searchResults);
				}
			}
		});
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