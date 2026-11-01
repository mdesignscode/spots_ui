// Every call to the Spots API (github.com/mdesignscode/spots_flask) goes through here.

const BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000/").replace(/\/?$/, "/");

export class ApiError extends Error {
  constructor(message, status, body = {}) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request(path, options) {
  let res;
  try {
    res = await fetch(BASE + path.replace(/^\//, ""), options);
  } catch {
    throw new ApiError("Can't reach the Spots API. Is it running?", 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
    throw new ApiError(message || `Request failed (${res.status})`, res.status, body);
  }
  return body;
}

const post = (path, data) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const isLink = (value) => /^https?:\/\//i.test(value.trim());

export const api = {
  status: () => request("status"),

  // a Spotify or YouTube url -> { resource_type: "single" | "playlist", ... }
  resolve: (url) => post("media/resolve", { url }),

  // plain YouTube search -> { results: YTVideoInfo[] }
  search: (q) => request(`media/search?q=${encodeURIComponent(q)}`),

  // one matched song as a tagged mp3; 409 when it was downloaded before
  downloadSong: (metadata, video) =>
    post("download/single", {
      title: metadata.title,
      artist: metadata.artist,
      link: metadata.link,
      artist_id: metadata.artist_id,
      cover: metadata.cover,
      tracknumber: metadata.tracknumber,
      album: metadata.album,
      lyrics: metadata.lyrics,
      release_date: metadata.release_date,
      id: video.id,
      uploader: video.uploader,
      audio_ext: video.audio_ext,
      filesize: video.filesize,
    }),

  // { "1080p": { format_id, height, ext, fps, filesize_mb, ... }, ... }
  resolutions: (video) => post("download/video/resolutions", video),

  // -> { message, file }
  downloadVideo: (video, resolution) => post("download/video", { ...video, resolution }),
};

// YouTube serves a still for every video id; used where the API has no cover.
export const thumbnail = (videoId) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

export const youtubeLink = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;
