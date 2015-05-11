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
	var songs = $('#songs');
	var playlistName = $('#title');
	var canView = $('#can-view-btn');
	var canEdit = $('#can-edit-btn');
	var sendInvites = $('#send-invites-btn');
	var inviteBtn = $('#invite');
	var usersToInvite = $('#users-to-invite');
	var ytAPIkey = 'AIzaSyDWuJQ9I7VNlCE1GMswlE0xzqDZgWbzW-E';
	var YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/';
	var currentPlaylistSongs = [];
	var playQueue = [];
	var pod = crosscloud.connect();
	var invitePermissions = 1;
	var queryString = window.location.href.split('?')[1];
	var playlistId = queryString.split('=')[1];
	var currentID = '';
	var currentViewUsers = [];
	var currentEditUsers = [];
	var editorBtnsShown = false;
	console.log(playlistId);

	pod.onLogin(function(userID) {
		console.log(userID);
		currentID = userID;
		getSongsInPlaylist(playlistId);
	});

	canView.click(function() {
		canView.toggleClass('active');
		canView.toggleClass('btn-primary');
		canEdit.toggleClass('active');
		canEdit.toggleClass('btn-primary');
		invitePermissions = 1;
	});

	canEdit.click(function() {
		canView.toggleClass('active');
		canView.toggleClass('btn-primary');
		canEdit.toggleClass('active');
		canEdit.toggleClass('btn-primary');
		invitePermissions = 2;
	});

	playlistName.click(function() {
		window.location.href = '../index';
	});

	searchSongBtn.click(function() {
		var songName = $("#song-name").val();
		var artistName = $('#song-artist').val();
		$('#song-name').val('');
		$('#song-artist').val('');
		searchResults.empty();
		searchSong(songName + ' ' + artistName);

		// console.log(searchSongs.data('playlist-id'));
		// console.log(songsAlreadyInPlaylist);
	});

	sendInvites.click(function() {
		var newUsers = usersToInvite.val().split(',');
		for (var i = 0; i < newUsers.length; i++) {
			newUsers[i] = newUsers[i].trim();
			if (newUsers[i].substr(newUsers[i].length - 1) != '/') {
				newUsers[i] = newUsers[i] + '/';
			}
			if (currentViewUsers.indexOf(newUsers[i]) == -1) {
				currentViewUsers.push(newUsers[i]);
			}
		}
		console.log(newUsers);
		if (invitePermissions == 1) {
			pod.push({
				_id: playlistId,
				canView: currentViewUsers
			});
		}
		else {
			for (var i = 0; i < newUsers.length; i++) {
				if (currentEditUsers.indexOf(newUsers[i]) == -1) {
					currentEditUsers.push(newUsers[i]);
				}
			}
			pod.push({
				_id: playlistId,
				canView: currentViewUsers,
				canEdit: currentEditUsers
			});
		}
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
		songs.empty();
		currentPlaylistSongs = item.songs;
		currentViewUsers = item.canView;
		currentEditUsers = item.canEdit;
		console.log(currentViewUsers);
		console.log(currentEditUsers);
		playlistName.text(item.name);
		console.log(currentPlaylistSongs);
		if (currentEditUsers.indexOf(currentID) > -1 && !editorBtnsShown) {
			searchSongBtn.toggleClass('hidden');
			inviteBtn.toggleClass('hidden');
			$("#song-name").toggleClass('hidden');
			$("#song-artist").toggleClass('hidden');
			editorBtnsShown = true;
		}
		for (var p = 0; p < currentPlaylistSongs.length; p++) {
			var song = currentPlaylistSongs[p];
			var songListItem = $('<li>', {
				text: song.name,
				id: song.videoId,
				class: "list-group-item"
			});
			songListItem.data('song-order-number', p);
			playQueue.push(song);
			songListItem.click(function(e) {
				queueList.empty();
				initializePlayQueue();
				player.loadVideoById(e.target.id);
				// playQueue.shift();
				var tmpQ = [];
				playQueue.splice($(e.target).data('song-order-number'));
				for (var i = 0; i < $(e.target).data('song-order-number'); i++) {
					tmpQ.push(playQueue.shift());
					console.log(tmpQ);
				}
				console.log('tmp is: ', tmpQ);
				for (var j = 0; j < tmpQ.length; j++) {
					playQueue.push(tmpQ[j]);
				}
				console.log('playQueue is: ', playQueue);
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
						for (var l = songQueueNumber; l < queueList.children().length; l++) {
							console.log(l);
							$($(queueList.children()[l]).children()[0]).data('song-queue-number', l);
						}
						console.log(queueList.children());
					});
					queueListCtn.append(queueListItem);
					queueListCtn.appendTo(queueList);
				}
			});
			if (editorBtnsShown) {
				songListItem.hover(function(e) {
					var trashIcon = $('<span>', {
						class: 'glyphicon glyphicon-trash align-right-trash'
					});
					trashIcon.click(function(e) {
						currentPlaylistSongs.splice($(this).parent().data('song-order-number'),1);
						pod.push({
							_id: playlistId,
							songs: currentPlaylistSongs
						});
						e.stopPropagation();
					});
					$(this).append(trashIcon);
				},function(e) {
					$(this).children()[0].remove();
				});
			}
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