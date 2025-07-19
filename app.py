from flask import Flask, render_template, request, jsonify
import random
import requests

app = Flask(__name__)

OMDB_API_KEY = "f62a29cf"
MOVIE_QUOTES_API = "https://movie-quote-api.herokuapp.com/v1/quote/"

# ------------------------ Fetch Functions ------------------------
def fetch_movie():
    movies = ["Inception", "Titanic", "The Avengers", "Dangal", "Interstellar", "3 Idiots", "Pathaan"]
    movie = random.choice(movies)
    try:
        r = requests.get(f"http://www.omdbapi.com/?t={movie}&apikey={OMDB_API_KEY}").json()
        return r['Title'].lower(), f"Year: {r.get('Year', '---')} | Actors: {r.get('Actors', 'N/A')}"
    except:
        return movie.lower(), "No hint available"

def fetch_dialogue():
    try:
        data = requests.get(MOVIE_QUOTES_API).json()
        return data['quote'].lower(), f"Movie: {data.get('show', 'Unknown')}"
    except:
        return "why so serious", "Movie: The Dark Knight"

def fetch_song():
    songs = [
        ("shape of you", "Artist: Ed Sheeran | Year: 2017"),
        ("blinding lights", "Artist: The Weeknd | Year: 2020"),
        ("levitating", "Artist: Dua Lipa | Year: 2021"),
        ("perfect", "Artist: Ed Sheeran | Year: 2017")
    ]
    return random.choice(songs)

def fetch_meme():
    memes = [
        ("how you doin", "Hint: Joey from Friends"),
        ("winter is coming", "Hint: Game of Thrones"),
        ("just do it", "Hint: Shia LaBeouf Meme"),
        ("yeh bhi theek hai", "Hint: Indian Meme")
    ]
    return random.choice(memes)

# ------------------------ Routes ------------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/game/<category>")
def game(category):
    return render_template("game.html", category=category)

@app.route("/new_game", methods=["POST"])
def new_game():
    category = request.json.get("category")
    if category == "Movies":
        phrase, hint = fetch_movie()
    elif category == "Songs":
        phrase, hint = fetch_song()
    elif category == "Dialogues":
        phrase, hint = fetch_dialogue()
    else:
        phrase, hint = fetch_meme()

    ai_guess = random.randint(3, 6)  # AI Predictor Mock
    return jsonify({"phrase": phrase, "hint": hint, "ai_guess": ai_guess})

if __name__ == "__main__":
    app.run(debug=True)
