var elem_trending_img
var elem_trending_text
var elem_tvshows_img
var elem_tvshows_text
var elem_home_content
var elem_search_content
var elem_home_tab
var elem_search_tab

var div_no_results
var div_show_results

var template_list_item

var main_page_objs
var main_page_index

function __init_site__()
{
	main_page_index = 0
	fetchElements()
	resizeFooter()
	fetchHomeInfo()
}

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

	div_no_results = document.getElementById("no_results")
	div_show_results = document.getElementById("show_results")

	template_list_item = document.getElementById("template_list_item")
}

function loopDisplay() {
	if (main_page_objs != null) {

		if (main_page_objs.trending[main_page_index].backdrop_path == null) elem_trending_img.style.backgroundImage = "url({{ url_for('static', filename='movie-placeholder.jpg')"
		else elem_trending_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + main_page_objs.trending[main_page_index].backdrop_path + ")";

		if (main_page_objs.airing[main_page_index].backdrop_path == null) elem_tvshows_img.style.backgroundImage = "url({{ url_for('static', filename='movie-placeholder.jpg')"
		else elem_tvshows_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + main_page_objs.airing[main_page_index].backdrop_path + ")";

		elem_trending_text.innerHTML = main_page_objs.trending[main_page_index].title + " (" + main_page_objs.trending[main_page_index].release_date.substr(0, 4) + ")";
		elem_tvshows_text.innerHTML = main_page_objs.airing[main_page_index].name + " (" + main_page_objs.airing[main_page_index].first_air_date.substr(0, 4) + ")";
		main_page_index = (main_page_index + 1) % 5;
	}
}

function fetchHomeInfo() {
	const url = "http://127.0.0.1:5000/trending-and-airing";
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			main_page_objs = JSON.parse(this.responseText);
			loopDisplay();
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
	setInterval(loopDisplay, 4000);
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

					// dynamic create div
					var current_count = div_show_results.childElementCount - 2;
					for (var i = current_count; i < objs.length; i++) {
						var node = template_list_item.cloneNode(true);
						node.id = "list_item";
						div_show_results.appendChild(node);
					}

					// fill into div
					var posters = document.getElementsByClassName("list_poster");
					var titles = document.getElementsByClassName("list_title");
					var genres = document.getElementsByClassName("list_genre");
					var years = document.getElementsByClassName("list_year");
					var ranks = document.getElementsByClassName("list_rank");
					var votes = document.getElementsByClassName("list_vote");
					var overviews = document.getElementsByClassName("list_overview");

					for (var i = 0; i < objs.length; i++) {

						var genres_string = '';
						if (objs[i].genre_strs != null) {
							for (var j = 0; j < objs[i].genre_strs.length; j++) {
								genres_string = genres_string + objs[i].genre_strs[j] + ', ';
							}
						}
						genres_string = genres_string == '' ? genres[0].innerHTML : genres_string.substr(0, genres_string.length-2);
						genres[i+1].innerHTML = genres_string

						posters[i+1].src = objs[i].poster_path ? "https://image.tmdb.org/t/p/w185" + objs[i].poster_path : posters[0].src;
						titles[i+1].innerHTML = objs[i].title ? objs[i].title : titles[0].innerHTML;
						years[i+1].innerHTML = objs[i].release_date ? objs[i].release_date.substr(0, 4) : years[0].innerHTML;
						ranks[i+1].innerHTML = objs[i].vote_average ? "&#9733;&nbsp;" + objs[i].vote_average/2 + "/5" : ranks[0].innerHTML;
						votes[i+1].innerHTML = objs[i].vote_count ? objs[i].vote_count + " votes" : votes[0].innerHTML;
						overviews[i+1].innerHTML = objs[i].overview ? objs[i].overview : overviews[0].innerHTML;
						div_show_results.children[i+2].style.display="block";
					}

					// hide redundant div
					for (var i = objs.length; i < current_count; i++) {
						div_show_results.children[i+2].style.display="none";
					}

					div_no_results.style.display="none";
					div_show_results.style.display="block";
				}
				else {
					div_no_results.style.display="block";
					div_show_results.style.display="none";
				}
			}
		};
		xhr.open("GET", proxy, true);
		xhr.send();
	}
}

function desearch() {
	var searchbox = document.forms["searchbox"]
	searchbox["keyword"].value = ""
	searchbox["category"].value = ""
	div_no_results.style.display="none";
	div_show_results.style.display="none";

}

function resizeFooter() {
	var h = (window.innerHeight - 164) + 'px'
	elem_home_content.style.minHeight = h
	elem_search_content.style.minHeight = h
}