$(document).ready(function() {
	var newPlaylistName = $('#playlist-name');
	var createPlaylistBox = $('#new-playlist-box');
	var createPlaylistButton = $('#create-playlist');
	var searchSongs = $('#search-song-box');
	var searchSongBtn = $('#search-song');
	var searchResults = $('#search-results-list');
	var shuffleBtn = $('#shuffle-songs');
	var queueList = $('#queue-list');
	var toPlaylistBtn = $('#to-playlist-page');
	var playlistName = $('#title');
	var ytAPIkey = 'AIzaSyDWuJQ9I7VNlCE1GMswlE0xzqDZgWbzW-E';
	var YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/';
	var currentPlaylistSongs = [];
	var playQueue = [];
	var pod = crosscloud.connect();
	console.log(window.location.href);
	var queryString = window.location.href.split('?')[1];
	console.log(queryString);
	var playlistId = queryString.split('=')[1];
	console.log(playlistId);

	pod.onLogin(function(userID) {
		console.log(userID);
		currentID = userID;
		getSongsInPlaylist(playlistId);
	});

	playlistName.click(function() {
		window.location.href = '../index';
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

	function displaySongsInPlaylist(item) {
		currentPlaylistSongs = item.songs;
		playlistName.text(item.name);
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
					queueListItem.data('song-queue-number', z);
					queueListItem.click(function(e) {
						songQueueNumber = $(e.target).data('song-queue-number');
						console.log(e.target);
						player.loadVideoById(playQueue[songQueueNumber].videoId);
						playQueue = playQueue.splice(songQueueNumber);
						console.log(playQueue);
						$(queueList.children()[songQueueNumber]).remove();
						for (var i = songQueueNumber; i < queueList.children().length; i++) {
							console.log(i);
							$($(queueList.children()[i]).children()[0]).data('song-queue-number', i);
						}
						console.log(queueList.children());
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

	function getSongsInPlaylist(id) {
		pod.query()
			.filter({
				_id: id
			})
			.onAllResults(function(items) {
				displaySongsInPlaylist(items[0]);
			}).start();
	}

	function initializePlayQueue() {
		playQueue = [];
		for (var i = 0; i < currentPlaylistSongs.length; i++) {
			playQueue.push(currentPlaylistSongs[i]);
		}
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
						var playlistID = playlistId;
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
});