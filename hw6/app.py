import json
from urllib import request
from flask import Flask, render_template

trending_url = 'https://api.themoviedb.org/3/trending/movie/week?api_key=67124d57621f4b2c70bb13cb9b38bacd'
airing_url = 'https://api.themoviedb.org/3/tv/airing_today?api_key=67124d57621f4b2c70bb13cb9b38bacd'

count = 5

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
	response = request.urlopen("https://api.themoviedb.org/3/trending/movie/week?api_key=67124d57621f4b2c70bb13cb9b38bacd")
	text = json.loads(response.read())
	results = []
	for i in range(0, count):
		obj = {
			'title': text['results'][i]['title'],
			'release_date': text['results'][i]['release_date'],
			'backdrop_path': text['results'][i]['backdrop_path']
		}
		results.append(obj)
	return json.dumps(results)

@app.route("/airing/")
def fetch_airing_today():
	response = request.urlopen("https://api.themoviedb.org/3/tv/airing_today?api_key=67124d57621f4b2c70bb13cb9b38bacd")
	text = json.loads(response.read())
	results = []
	for i in range(0, count):
		obj = {
			'name': text['results'][i]['name'],
			'first_air_date': text['results'][i]['first_air_date'],
			'backdrop_path': text['results'][i]['backdrop_path']
		}
		results.append(obj)
	return json.dumps(results)

if __name__ == '__main__':
	app.run(debug = True)