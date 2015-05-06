$(document).ready(function() {
	console.log(window.location.href);
	var queryString = window.location.href.split('?')[1];
	console.log(queryString);
	var id = queryString.split('=')[1];
	console.log(id);
});