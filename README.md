# Spots UI

A web UI for the [Spots API](https://github.com/mdesignscode/spots_flask). Paste a Spotify or YouTube link, or search YouTube, then:

* download songs as tagged mp3s, one at a time or a whole playlist, album or artist's tracks
* download any YouTube video as mp4 at the resolution you pick, with its size shown before you download

The API saves the files to your Downloads folder.

Built with React and bundled with esbuild (targets ES6, for older 32-bit browsers).

## Requirements

* [Node.js](https://nodejs.org/en/download/)
* The Spots API running locally (see its README)

## Setup

```bash
git clone https://github.com/mdesignscode/spots_ui
cd spots_ui
npm install
```

Create a `.env` file with the API's address:

```
REACT_APP_API_URL=http://localhost:5000/
```

## Run

```bash
npm run build   # build into dist/
npm start       # serve on http://localhost:3000
```

While working on the UI, `npm run dev` rebuilds on every change and reloads the page.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
