var elem_trending_img
var elem_trending_text
var elem_tvshows_img
var elem_tvshows_text
var elem_home_content
var elem_search_content
var elem_home_tab
var elem_search_tab

function fetchElements()
{
	elem_trending_img = document.getElementById("trending_img")
	elem_trending_text = document.getElementById("trending_text")
	elem_tvshows_img = document.getElementById("tvshows_img")
	elem_tvshows_text = document.getElementById("tvshows_text")
	elem_home_content = document.getElementById("home_content")
	elem_search_content = document.getElementById("search_content")
	elem_home_tab = document.getElementById("home_tab")
	elem_search_tab = document.getElementById("search_tab")
}

function fetchHomeInfo() {
	fetchElements();
	resizeFooter();
	const url = "http://127.0.0.1:5000/trending-and-airing";
	var xhr = new XMLHttpRequest();
	index = 0;
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			objs = JSON.parse(this.responseText);
			elem_trending_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + objs.trending[index].backdrop_path + ")";
			elem_trending_text.innerHTML = objs.trending[index].title + " (" + objs.trending[index].release_date.substr(0, 4) + ")";
			elem_tvshows_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + objs.airing[index].backdrop_path + ")";
			elem_tvshows_text.innerHTML = objs.airing[index].name + " (" + objs.airing[index].first_air_date.substr(0, 4) + ")";
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
	setInterval(function() {
		index = index + 1;
		index_a = index % objs.trending.length;
		index_b = index % objs.airing.length;
		elem_trending_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + objs.trending[index_a].backdrop_path + ")";
		elem_trending_text.innerHTML = objs.trending[index_a].title + " (" + objs.trending[index_a].release_date.substr(0, 4) + ")";
		elem_tvshows_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + objs.airing[index_b].backdrop_path + ")";
		elem_tvshows_text.innerHTML = objs.airing[index_b].name + " (" + objs.airing[index_b].first_air_date.substr(0, 4) + ")";
	}, 4000);
}

function switchTab(index) {
	if (index == 0) {
		current_tab = elem_home_tab
		closed_tab = elem_search_tab
		elem_home_content.style.display="block"
		elem_search_content.style.display="none"
	}
	else if (index == 1) {
		current_tab = elem_search_tab
		closed_tab = elem_home_tab
		elem_home_content.style.display="none"
		elem_search_content.style.display="block"
	}
	current_tab.style.color = "#990000"
	current_tab.style.borderBottom = "1px solid white"
	closed_tab.style.color = "white"
	closed_tab.style.borderBottom = "0px"
}

function search() {
	const url = "http://127.0.0.1:5000/search";
	var searchbox = document.forms["searchbox"]
	var keyword = searchbox["keyword"].value.trim()
	var category = searchbox["category"].value.trim()
	if (keyword == "" || category == "") {
		alert("Please enter valid values.")
	}
	else {
		var proxy = url + '?' + 'keyword=' + keyword + '&' + 'category' + '=' + category;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				objs = JSON.parse(this.responseText);
				if (objs.length > 0) {
					document.getElementById("no_results").style.display="none";
				}
				else document.getElementById("no_results").style.display="block";
			}
		};
		xhr.open("GET", proxy, true);
		xhr.send();
	}
}

function clear() {
	var searchbox = document.forms["searchbox"]
	searchbox["keyword"].value = ""
	searchbox["category"].value = ""
}

function resizeFooter() {
	var h = (window.innerHeight - 155) + 'px'
	elem_home_content.style.minHeight = h
	elem_search_content.style.minHeight = h
}