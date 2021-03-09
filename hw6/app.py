import json
from urllib import request
from flask import Flask, render_template
from flask import request as flask_request

api_key = '67124d57621f4b2c70bb13cb9b38bacd'

trending_endpoint = 'https://api.themoviedb.org/3/trending/movie/week?api_key=<<api_key>>'
tv_airing_today_endpoint = 'https://api.themoviedb.org/3/tv/airing_today?api_key=<<api_key>>'
search_endpoint = 'https://api.themoviedb.org/3/search/<<category>>?api_key=<<api_key>>&language=en-US&query=<<search_query>>&page=1&include_adult=false';
genre_endpoint = 'https://api.themoviedb.org/3/genre/<<category>>/list?api_key=<<api_key>>&language=en-US'

genre_dict = {}
app = Flask(__name__)

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/trending-and-airing/")
def fetch_trending_and_airing():
	results = {}
	results['trending'] = json.loads(fetch_trending_movies())
	results['airing'] = json.loads(fetch_airing_today())
	return json.dumps(results)

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
	response = request.urlopen(tv_airing_today_endpoint.replace('<<api_key>>', api_key))
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
	return json.dumps([])


def search_movie(url):
	response = request.urlopen(url)
	text = json.loads(response.read())
	results = []
	for i in range(0, len(text['results'])):
		obj = text['results'][i]
		results.append({
			'id': obj['id'],
			'title': obj['title'],
			'overview': obj['overview'],
			'poster_path': obj['poster_path'],
			'release_date': obj['release_date'],
			'vote_average': obj['vote_average'],
			'vote_count': obj['vote_count'],
			'genre_strs': convert_genre('movie', obj['genre_ids'])}
		)
	return json.dumps(results)


def search_tv(url):
	response = request.urlopen(url)
	text = json.loads(response.read())
	results = []
	for i in range(0, len(text['results'])):
		obj = text['results'][i]
		results.append({
			'id': obj['id'],
			'title': obj['name'],
			'overview': obj['overview'],
			'poster_path': obj['poster_path'],
			'release_date': obj['first_air_date'],
			'vote_average': obj['vote_average'],
			'vote_count': obj['vote_count'],
			'genre_strs': convert_genre('tv', obj['genre_ids'])}
		)
	return json.dumps(results)


def search_multi(url):
	response = request.urlopen(url)
	text = json.loads(response.read())
	results = []
	for i in range(0, len(text['results'])):
		obj = text['results'][i]
		if obj['media_type'] == 'movie':
			results.append({
				'id': obj['id'],
				'title': obj['title'],
				'overview': obj['overview'],
				'poster_path': obj['poster_path'],
				'release_date': obj['release_date'],
				'vote_average': obj['vote_average'],
				'vote_count': obj['vote_count'],
				'genre_strs': convert_genre('movie', obj['genre_ids'])}
			)
		elif obj['media_type'] == 'tv':
			results.append({
				'id': obj['id'],
				'title': obj['name'],
				'overview': obj['overview'],
				'poster_path': obj['poster_path'],
				'release_date': obj['first_air_date'],
				'vote_average': obj['vote_average'],
				'vote_count': obj['vote_count'],
				'genre_strs': convert_genre('tv', obj['genre_ids'])}
			)
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


if __name__ == '__main__':
	app.run(debug = True)