import json
from urllib import request
from flask import Flask, render_template, abort
from flask import request as flask_request

api_key = '67124d57621f4b2c70bb13cb9b38bacd'

airing_endpoint = 'https://api.themoviedb.org/3/tv/airing_today?api_key=<<api_key>>'
trending_endpoint = 'https://api.themoviedb.org/3/trending/movie/week?api_key=<<api_key>>'
search_endpoint = 'https://api.themoviedb.org/3/search/<<category>>?api_key=<<api_key>>&language=en-US&query=<<search_query>>&page=1&include_adult=false';
genre_endpoint = 'https://api.themoviedb.org/3/genre/<<category>>/list?api_key=<<api_key>>&language=en-US'
detail_endpoint = 'https://api.themoviedb.org/3/<<category>>/<<id>>?api_key=<<api_key>>&language=en-US'
credit_endpoint = 'https://api.themoviedb.org/3/<<category>>/<<id>>/credits?api_key=<<api_key>>&language=en-US'
review_endpoint = 'https://api.themoviedb.org/3/<<category>>/<<id>>/reviews?api_key=<<api_key>>&language=en-US&page=1'

genre_dict = {}
app = Flask(__name__)

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/trending-and-airing/")
def fetch_trending_and_airing():
	result = {}
	result['trending'] = json.loads(fetch_trending_movies())
	result['airing'] = json.loads(fetch_airing_today())
	return json.dumps(result)


@app.route("/trending/")
def fetch_trending_movies():
	response = request.urlopen(trending_endpoint.replace('<<api_key>>', api_key))
	text = json.loads(response.read())
	results = []
	for i in range(0, 5):
		obj = {
			'title': text['results'][i]['title'],
			'release_date': text['results'][i]['release_date'],
			'backdrop_path': text['results'][i]['backdrop_path']
		}
		results.append(obj)
	return json.dumps(results)


@app.route("/airing/")
def fetch_airing_today():
	response = request.urlopen(airing_endpoint.replace('<<api_key>>', api_key))
	text = json.loads(response.read())
	results = []
	for i in range(0, 5):
		obj = {
			'name': text['results'][i]['name'],
			'first_air_date': text['results'][i]['first_air_date'],
			'backdrop_path': text['results'][i]['backdrop_path']
		}
		results.append(obj)
	return json.dumps(results)


@app.route("/search/", methods = ['GET'])
def search_tmdb():
	keyword = flask_request.args.get('keyword')
	category = flask_request.args.get('category')
	url = search_endpoint
	url = url.replace('<<api_key>>', api_key)
	url = url.replace('<<category>>', category)
	url = url.replace('<<search_query>>', keyword.replace(' ', '%20'))

	update_genre()
	if category == 'movie':
		return search_movie(url)
	elif category == 'tv':
		return search_tv(url)
	elif category == 'multi':
		return search_multi(url)
	else:
		abort(404)
	return json.dumps([])


def search_movie(url):
	response = request.urlopen(url)
	text = json.loads(response.read())
	results = []
	for i in range(0, len(text['results'])):
		obj = text['results'][i]
		candidate = {}
		if 'id' in obj: candidate['id'] = obj['id']
		if 'title' in obj: candidate['title'] = obj['title']
		if 'overview' in obj: candidate['overview'] = obj['overview']
		if 'poster_path' in obj: candidate['poster_path'] = obj['poster_path']
		if 'release_date' in obj: candidate['release_date'] = obj['release_date']
		if 'vote_average' in obj: candidate['vote_average'] = obj['vote_average']
		if 'vote_count' in obj: candidate['vote_count'] = obj['vote_count']
		if 'genre_ids' in obj: candidate['genre_strs'] = convert_genre('movie', obj['genre_ids'])
		results.append(candidate)
	return json.dumps(results)


def search_tv(url):
	response = request.urlopen(url)
	text = json.loads(response.read())
	results = []
	for i in range(0, len(text['results'])):
		obj = text['results'][i]
		candidate = {}
		if 'id' in obj: candidate['id'] = obj['id']
		if 'name' in obj: candidate['name'] = obj['name']
		if 'overview' in obj: candidate['overview'] = obj['overview']
		if 'poster_path' in obj: candidate['poster_path'] = obj['poster_path']
		if 'first_air_date' in obj: candidate['first_air_date'] = obj['first_air_date']
		if 'vote_average' in obj: candidate['vote_average'] = obj['vote_average']
		if 'vote_count' in obj: candidate['vote_count'] = obj['vote_count']
		if 'genre_ids' in obj: candidate['genre_strs'] = convert_genre('tv', obj['genre_ids'])
		results.append(candidate)
	return json.dumps(results)


def search_multi(url):
	response = request.urlopen(url)
	text = json.loads(response.read())
	results = []
	for i in range(0, len(text['results'])):
		obj = text['results'][i]
		candidate = {}
		if obj['media_type'] == 'movie':
			if 'id' in obj: candidate['id'] = obj['id']
			if 'title' in obj: candidate['title'] = obj['title']
			if 'overview' in obj: candidate['overview'] = obj['overview']
			if 'poster_path' in obj: candidate['poster_path'] = obj['poster_path']
			if 'release_date' in obj: candidate['release_date'] = obj['release_date']
			if 'vote_average' in obj: candidate['vote_average'] = obj['vote_average']
			if 'vote_count' in obj: candidate['vote_count'] = obj['vote_count']
			if 'genre_ids' in obj: candidate['genre_strs'] = convert_genre('movie', obj['genre_ids'])
		elif obj['media_type'] == 'tv':
			if 'id' in obj: candidate['id'] = obj['id']
			if 'name' in obj: candidate['name'] = obj['name']
			if 'overview' in obj: candidate['overview'] = obj['overview']
			if 'poster_path' in obj: candidate['poster_path'] = obj['poster_path']
			if 'first_air_date' in obj: candidate['first_air_date'] = obj['first_air_date']
			if 'vote_average' in obj: candidate['vote_average'] = obj['vote_average']
			if 'vote_count' in obj: candidate['vote_count'] = obj['vote_count']
			if 'genre_ids' in obj: candidate['genre_strs'] = convert_genre('tv', obj['genre_ids'])
		else: continue
		results.append(candidate)
	return json.dumps(results)


def update_genre():
	global genre_dict
	if 'movie' not in genre_dict:
		response = request.urlopen(genre_endpoint.replace('<<category>>', 'movie').replace('<<api_key>>', api_key))
		text = json.loads(response.read())
		genre_dict['movie'] = {}
		for i in range(0, len(text['genres'])):
			genre_dict['movie'][text['genres'][i]['id']] = text['genres'][i]['name']
	if 'tv' not in genre_dict:
		response = request.urlopen(genre_endpoint.replace('<<category>>', 'tv').replace('<<api_key>>', api_key))
		text = json.loads(response.read())
		genre_dict['tv'] = {}
		for i in range(0, len(text['genres'])):
			genre_dict['tv'][text['genres'][i]['id']] = text['genres'][i]['name']


def convert_genre(category, ids):
	results = []
	if category not in genre_dict:
		return ['Unknown']
	for i in range(0, len(ids)):
		results.append(genre_dict[category][ids[i]])
	return results


@app.route("/detail/<category>/<id>")
def fetch_details(category, id):
	if category != 'movie' and category != 'tv':
		abort(404)
	else:
		url = detail_endpoint.replace('<<category>>', category).replace('<<id>>', id).replace('<<api_key>>', api_key)
		response = request.urlopen(url)
		text = json.loads(response.read())
		result = {}
		genres = []
		spoken_languages = []
		for i in range(0, len(text['genres'])):
			genres.append(text['genres'][i]['name'])
		for i in range(0, len(text['spoken_languages'])):
			spoken_languages.append(text['spoken_languages'][i]['english_name'])
		result['genres'] = genres
		result['spoken_languages'] = spoken_languages
		if category == 'movie':
			if 'id' in text: result['id'] = text['id']
			if 'title' in text: result['title'] = text['title']
			if 'runtime' in text: result['runtime'] = text['runtime']
			if 'release_date' in text: result['release_date'] = text['release_date']
			if 'vote_average' in text: result['vote_average'] = text['vote_average']
			if 'vote_count' in text: result['vote_count'] = text['vote_count']
			if 'poster_path' in text: result['poster_path'] = text['poster_path']
			if 'backdrop_path' in text: result['backdrop_path'] = text['backdrop_path']
		else:
			if 'backdrop_path' in text: result['backdrop_path'] = text['backdrop_path']
			if 'episode_run_time' in text: result['episode_run_time'] = text['episode_run_time']
			if 'first_air_date' in text: result['first_air_date'] = text['first_air_date']
			if 'id' in text: result['id'] = text['id']
			if 'name' in text: result['name'] = text['name']
			if 'number_of_seasons' in text: result['number_of_seasons'] = text['number_of_seasons']
			if 'overview' in text: result['overview'] = text['overview']
			if 'poster_path' in text: result['poster_path'] = text['poster_path']
			if 'vote_average' in text: result['vote_average'] = text['vote_average']
			if 'vote_count' in text: result['vote_count'] = text['vote_count']
		return json.dumps(result)


@app.route("/credit/<category>/<id>")
def fetch_credits(category, id):
	if category != 'movie' and category != 'tv':
		abort(404)
	else:
		url = credit_endpoint.replace('<<category>>', category).replace('<<id>>', id).replace('<<api_key>>', api_key)
		response = request.urlopen(url)
		casts = json.loads(response.read())['cast']
		results = []
		for i in range(0, min(8, len(casts))):
			results.append({
				'name': casts[i]['name'],
				'profile_path': casts[i]['profile_path'],
				'character': casts[i]['character']
			})
		return json.dumps(results)


@app.route("/review/<category>/<id>")
def fetch_reviews(category, id):
	if category != 'movie' and category != 'tv':
		abort(404)
	else:
		url = review_endpoint.replace('<<category>>', category).replace('<<id>>', id).replace('<<api_key>>', api_key)
		response = request.urlopen(url)
		reviews = json.loads(response.read())['results']
		results = []
		for i in range(0, min(5, len(reviews))):
			results.append({
				'username': reviews[i]['author_details']['username'],
				'content': reviews[i]['content'],
				'rating': reviews[i]['author_details']['rating'],
				'created_at': reviews[i]['created_at']
			})
		return json.dumps(results)


@app.route("/fetch-all/<category>/<id>")
def fetch_all(category, id):
	result = {}
	result['details'] = json.loads(fetch_details(category, id))
	result['credits'] = json.loads(fetch_credits(category, id))
	result['reviews'] = json.loads(fetch_reviews(category, id))
	return json.dumps(result)

if __name__ == '__main__':
	app.run(debug = True)