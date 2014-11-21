$( document ).ready(function () {
    var podURL = function () {
        return "http://playlists.fakepods.com"
    }
    
    var reload = function () {
        var request = new XMLHttpRequest();
        request.open("GET", podURL() + "/_active", true);
        request.onreadystatechange = function () {
            if (request.readyState==4 && request.status==200) {
                handleResponse(request.responseText);
            }
        }
        request.send();
    };
    reload();
    
    var handleResponse = function (responseText) {
        var responseJSON = JSON.parse(responseText);
        var etag = responseJSON._etag;
        var members = responseJSON._members;
        for (i in members) {
            if (members[i].songs && members[i].name){
                var cont = document.createElement("div");
                var plName = document.createElement("b");
                var songlist = document.createElement("ul");
                plName.innerHTML = members[i].name;
                cont.appendChild(plName);
                $("#playlists").append(cont);
                for (j in members[i].songs) {
                    var song = document.createElement("li");
                    song.innerHTML = members[i].songs[j].title;
                    songlist.appendChild(song);
                }
                $("#playlists").append(songlist);
            }
        }
    }
    
    var createPlaylist = function(plname, songs) {
        var request = new XMLHttpRequest();
        request.open("POST", podURL(), true);
        var content = JSON.stringify({
            name: plname,
            songs: songs
        });
        request.setRequestHeader("Content-type", "application/json");
        request.send(content);
        reload();
    }
    
    $("#submit-playlist").click(function() {
        var plname = $("#playlist-name").val();
        var songsString = $("#playlist-input").val();
        var songsArray = songsString.split(",");
        var songs = [];
        for (i in songsArray) {
            var obj = {
                title: songsArray[i]
            }
            songs.push(obj);
        }
        createPlaylist(plname, songs);
    });
});