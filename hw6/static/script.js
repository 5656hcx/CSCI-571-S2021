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
var div_no_casts
var div_show_casts
var div_no_reviews
var div_show_reviews

var template_list_item
var template_cast_item
var template_review_item

var main_page_objs
var main_page_index

const proxy_url = 'http://127.0.0.1:5000/'

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
	div_no_casts = document.getElementById("no_casts")
	div_show_casts = document.getElementById("show_casts")
	div_no_reviews = document.getElementById("no_reviews")
	div_show_reviews = document.getElementById("show_reviews")

	template_list_item = document.getElementById("template_list_item")
	template_cast_item = document.getElementById("template_cast_item")
	template_review_item = document.getElementById("template_review_item")
}

function loopDisplay() {
	if (main_page_objs != null) {

		if (main_page_objs.trending[main_page_index].backdrop_path == null) elem_trending_img.style.backgroundImage = "/static/movie-placeholder.jpg"
		else elem_trending_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + main_page_objs.trending[main_page_index].backdrop_path + ")";

		if (main_page_objs.airing[main_page_index].backdrop_path == null) elem_tvshows_img.style.backgroundImage = "/static/movie-placeholder.jpg"
		else elem_tvshows_img.style.backgroundImage = "url(" + "https://image.tmdb.org/t/p/w780" + main_page_objs.airing[main_page_index].backdrop_path + ")";

		elem_trending_text.innerHTML = main_page_objs.trending[main_page_index].title + " (" + main_page_objs.trending[main_page_index].release_date.substr(0, 4) + ")";
		elem_tvshows_text.innerHTML = main_page_objs.airing[main_page_index].name + " (" + main_page_objs.airing[main_page_index].first_air_date.substr(0, 4) + ")";
		main_page_index = (main_page_index + 1) % 5;
	}
}

function fetchHomeInfo() {
	const url = proxy_url + "trending-and-airing";
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
	const url = proxy_url + "search";
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
					var showmores = document.getElementsByClassName("list_showmore");

					for (var i = 0; i < objs.length; i++) {

						let val_genre = '';
						if (objs[i].genre_strs != null) {
							for (var j = 0; j < objs[i].genre_strs.length; j++) {
								val_genre = val_genre + objs[i].genre_strs[j] + ', ';
							}
						}
						val_genre = val_genre == '' ? genres[0].innerHTML : val_genre.substr(0, val_genre.length-2);
						genres[i+1].innerHTML = val_genre;

						let val_src = objs[i].poster_path ? "https://image.tmdb.org/t/p/w185" + objs[i].poster_path : posters[0].src;
						let val_rank = objs[i].vote_average ? "&#9733;&nbsp;" + objs[i].vote_average/2 + "/5" : ranks[0].innerHTML;
						let val_vote = objs[i].vote_count ? objs[i].vote_count + " votes" : votes[0].innerHTML;
						let val_overview = objs[i].overview ? objs[i].overview : overviews[0].innerHTML;
						let val_id = objs[i].id ? objs[i].id : 0;
						let val_category = (objs[i].title == null && objs[i].release_date == null) ? 'tv' : 'movie';

						let val_title;
						let val_year;
						if (val_category == 'movie') {
							val_title = objs[i].title ? objs[i].title : titles[0].innerHTML;
							val_year = objs[i].release_date ? objs[i].release_date.substr(0, 4) : years[0].innerHTML;
						}
						else {
							val_title = objs[i].name ? objs[i].name : titles[0].innerHTML;
							val_year = objs[i].first_air_date ? objs[i].first_air_date.substr(0, 4) : years[0].innerHTML;
						}

						posters[i+1].src = val_src;
						titles[i+1].innerHTML = val_title;
						years[i+1].innerHTML = val_year;
						ranks[i+1].innerHTML = val_rank;
						votes[i+1].innerHTML = val_vote;
						overviews[i+1].innerHTML = val_overview;

						showmores[i+1].onclick = function() {
							popup(
								val_category,
								val_id,
								val_title,
								val_overview,
								val_year,
								val_genre,
								val_rank,
								val_vote
							)
						};
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

function popup(category, id, title, overview, year, genre, rank, vote) {
	const url = proxy_url + "fetch-all/" + category + '/' + id;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			objs = JSON.parse(this.responseText);

			// fetch missing info
			if (objs.details.backdrop_path == null)
				document.getElementById("popups_poster").src = "/static/movie-placeholder.jpg";
			else
				document.getElementById("popups_poster").src = "https://image.tmdb.org/t/p/w780" + objs.details.backdrop_path;
			if (objs.details.spoken_languages.length == 0)
				document.getElementById("popups_language").innerHTML = "Unknown";
			else {
				var languages = "";
				for (var i = 0; i < objs.details.spoken_languages.length; i++) {
					languages = languages + objs.details.spoken_languages[i] + ', ';
				}
				languages = languages == '' ? "Unknown" : languages.substr(0, languages.length-2);
				document.getElementById("popups_language").innerHTML = languages;
			}

			// fetch credits
			if (objs.credits == null || objs.credits.length == 0) {
				div_no_casts.style.display = "block";
				div_show_casts.style.display = "none";
			}
			else {
				var current_count = div_show_casts.childElementCount - 1;
				for (var i = current_count; i < objs.credits.length; i++) {
					var node = template_cast_item.cloneNode(true);
					node.id = "cast_item";
					div_show_casts.appendChild(node);
				}

				var profiles = document.getElementsByClassName("cast_image");
				var names = document.getElementsByClassName("cast_name");
				var roles = document.getElementsByClassName("cast_role");
				for (var i = 0; i < objs.credits.length; i++) {
					profiles[i+1].src = objs.credits[i].profile_path ? "https://image.tmdb.org/t/p/w185" + objs.credits[i].profile_path : profiles[0].src;
					names[i+1].innerHTML = objs.credits[i].name ? objs.credits[i].name : names[0].innerHTML;
					roles[i+1].innerHTML = objs.credits[i].character ? objs.credits[i].character : roles[0].innerHTML;
					div_show_casts.children[i+1].style.display="block";
				}

				for (var i = objs.credits.length; i < current_count; i++) {
					div_show_casts.children[i+1].style.display = "none";
				}

				div_no_casts.style.display = "none";
				div_show_casts.style.display = "block";
			}

			// fetch reviews
			if (objs.reviews == null || objs.reviews.length == 0) {
				div_no_reviews.style.display = "block";
				div_show_reviews.style.display = "none";
			}
			else {
				var current_count = div_show_reviews.childElementCount - 1;
				for (var i = current_count; i < objs.reviews.length; i++) {
					var node = template_review_item.cloneNode(true);
					node.id = "review_item";
					div_show_reviews.appendChild(node);
				}

				var users = document.getElementsByClassName("review_user");
				var dates = document.getElementsByClassName("review_date");
				var ranks = document.getElementsByClassName("review_rank");
				var contents = document.getElementsByClassName("review_content");
				for (var i = 0; i < objs.reviews.length; i++) {
					users[i+1].innerHTML = objs.reviews[i].username ? objs.reviews[i].username : users[0].innerHTML;
					dates[i+1].innerHTML = objs.reviews[i].created_at ? convertDate(objs.reviews[i].created_at.substr(0, 10)) : dates[0].innerHTML;
					contents[i+1].innerHTML = objs.reviews[i].content ? objs.reviews[i].content : contents[0].innerHTML;
					ranks[i+1].innerHTML = objs.reviews[i].rating ? "&#9733;&nbsp;" + objs.reviews[i].rating/2 + "/5" : ranks[0].innerHTML;
					ranks[i+1].style.display = objs.reviews[i].rating ? "block" : "none";
					div_show_reviews.children[i+1].style.display="block";
				}

				for (var i = objs.reviews.length; i < current_count; i++) {
					div_show_reviews.children[i+1].style.display="none";
				}

				div_no_reviews.style.display = "none";
				div_show_reviews.style.display = "block";
			}
		}
	}

	// copy cached info
	div_no_casts.style.display = "none";
	div_show_casts.style.display = "none";
	div_no_reviews.style.display = "none";
	div_show_reviews.style.display = "none";
	document.getElementById("popups_poster").src = "/static/movie-placeholder.jpg";
	document.getElementById("popups_title").innerHTML = title;
	document.getElementById("popups_overview").innerHTML = overview;
	document.getElementById("popups_year").innerHTML = year;
	document.getElementById("popups_genre").innerHTML = genre;
	document.getElementById("popups_rank").innerHTML = rank;
	document.getElementById("popups_vote").innerHTML = vote;
	document.getElementById("popups_link").href = "https://www.themoviedb.org/" + category + '/' + id;
	document.getElementById("popups").style.display = "block";

	xhr.open("GET", url, true);
	xhr.send();
}

function convertDate(date_str) {
	return date_str.substr(5, 2) + '/' + date_str.substr(8, 2) + '/' + date_str.substr(0, 4);
}