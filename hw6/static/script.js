function homepage() {
	var home = document.getElementById("home_tab")
	var search = document.getElementById("search_tab")
	home.style.color = "#990000"
	home.style.borderBottom = "1px solid white"
	search.style.color = "white"
	search.style.borderBottom = "0px"
	document.getElementById("home_content").style.display="block"
	document.getElementById("search_content").style.display="none"
}

function searchpage() {
	var home = document.getElementById("home_tab")
	var search = document.getElementById("search_tab")
	home.style.color = "white"
	home.style.borderBottom = "0px"
	search.style.color = "#990000"
	search.style.borderBottom = "1px solid white"
	document.getElementById("home_content").style.display="none"
	document.getElementById("search_content").style.display="block"
}

function validateForm() {
	var searchbox = document.forms["searchbox"]
	if (searchbox["keyword"].value == "" || searchbox["category"].value == "") {
		alert("Please enter valid values.")
	}
}

function clearForm() {
	var searchbox = document.forms["searchbox"]
	searchbox["keyword"].value = ""
	searchbox["category"].value = ""
}

function resizeFooter() {
	var h = (window.innerHeight - 140) + 'px'
	document.getElementById("home_content").style.minHeight = h
	document.getElementById("search_content").style.minHeight = h
}

window.onload = resizeFooter;
window.onresize = resizeFooter;