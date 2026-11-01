import { useState } from "react";
import { api, thumbnail, youtubeLink } from "./api";
import VideoPicker from "./VideoPicker";
import { Cover, megabytes, TaskStatus, useTask } from "./ui";

// ---- one song ---------------------------------------------------------------

export function SingleView({ resource }) {
  const { metadata, video_info: video } = resource;
  const [mp3, run] = useTask();
  const [showVideo, setShowVideo] = useState(false);

  const meta = [metadata.album, metadata.release_date?.slice(0, 4), `${video.filesize} MB as mp3`]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="panel" aria-labelledby="single-title">
      <header className="object">
        <Cover src={metadata.cover || thumbnail(video.id)} className="cover--lg" />
        <div className="object__body">
          <h1 id="single-title" className="title">{metadata.title}</h1>
          <p className="lead">{metadata.artist}</p>
          <p className="muted small">{meta}</p>
          <p className="muted small">
            Matched to{" "}
            <a href={youtubeLink(video.id)} target="_blank" rel="noreferrer">
              {video.uploader} – {video.title}
            </a>
          </p>
        </div>
        <div className="object__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={mp3.status === "busy" || mp3.status === "done"}
            onClick={() => run(() => api.downloadSong(metadata, video))}
          >
            Download mp3
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            aria-expanded={showVideo}
            onClick={() => setShowVideo((v) => !v)}
          >
            {showVideo ? "Hide video" : "Download video"}
          </button>
          <TaskStatus task={mp3} />
        </div>
      </header>
      {mp3.status === "failed" && <p className="error-line">{mp3.message}</p>}
      {showVideo && <VideoPicker video={video} />}
    </section>
  );
}

// ---- a playlist, album or artist's tracks ---------------------------------------

function TrackRow({ track, index, checked, onToggle, task, onDownload }) {
  const { metadata, video } = track;
  const [showVideo, setShowVideo] = useState(false);
  const title = metadata.title || video.title;

  return (
    <li className={`track${showVideo ? " is-open" : ""}`}>
      <label className="track__pick">
        <input type="checkbox" checked={checked} onChange={onToggle} aria-label={`Include ${title}`} />
        <span className="num muted">{index + 1}</span>
      </label>
      <Cover src={metadata.cover || thumbnail(video.id)} />
      <div className="track__body">
        <span className="track__title">{title}</span>
        <span className="muted small">
          {metadata.artist || video.uploader}
          {metadata.is_fallback && <span className="pill pill--warning">No match, YouTube title</span>}
        </span>
      </div>
      <span className="num muted right track__size">{megabytes(video.filesize)}</span>
      <span className="track__status">
        <TaskStatus task={task} />
      </span>
      <span className="track__actions">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={task.status === "busy" || task.status === "done"}
          onClick={onDownload}
        >
          mp3
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          aria-expanded={showVideo}
          onClick={() => setShowVideo((v) => !v)}
        >
          Video
        </button>
      </span>
      {task.status === "failed" && <p className="error-line track__wide">{task.message}</p>}
      {showVideo && (
        <div className="track__wide">
          <VideoPicker video={video} />
        </div>
      )}
    </li>
  );
}

// Per-track download state, keyed by video id, so "Download selected" and
// a row's own button share one status.
function useTrackTasks() {
  const [tasks, setTasks] = useState({});
  const set = (id, value) => setTasks((all) => ({ ...all, [id]: value }));
  const run = async (track) => {
    const id = track.video.id;
    set(id, { status: "busy", started: Date.now() });
    try {
      await api.downloadSong(track.metadata, track.video);
      set(id, { status: "done" });
    } catch (err) {
      set(id, err.status === 409 ? { status: "exists" } : { status: "failed", message: err.message });
    }
  };
  return [tasks, run];
}

export function PlaylistView({ resource }) {
  const info = resource.playlist_info;
  const tracks = info.provider_metadata
    .map((metadata, i) => ({ metadata, video: info.youtube_metadata[i] }))
    .filter((t) => t.video);
  const unavailable = info.unavailable || [];

  const [selected, setSelected] = useState(() => new Set(tracks.map((t) => t.video.id)));
  const [tasks, runTrack] = useTrackTasks();
  const [batch, setBatch] = useState(null); // { done, total } while "Download selected" runs

  const idle = { status: "idle" };
  const picked = tracks.filter((t) => selected.has(t.video.id));
  const pickedMB = picked.reduce((sum, t) => sum + (t.video.filesize || 0), 0);
  const allPicked = picked.length === tracks.length;
  const saved = tracks.filter((t) => ["done", "exists"].includes(tasks[t.video.id]?.status)).length;

  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // One at a time: the API shares one yt-dlp client, so parallel downloads
  // could write to each other's file names.
  const downloadSelected = async () => {
    const queue = picked.filter((t) => !["done", "exists"].includes(tasks[t.video.id]?.status));
    setBatch({ done: 0, total: queue.length });
    for (const [i, track] of queue.entries()) {
      await runTrack(track);
      setBatch({ done: i + 1, total: queue.length });
    }
    setBatch(null);
  };

  const counts = [
    `${tracks.length} tracks`,
    saved ? `${saved} saved` : null,
    unavailable.length ? `${unavailable.length} unavailable` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="panel" aria-labelledby="playlist-title">
      <header className="object">
        <Cover src={info.cover} className="cover--lg" />
        <div className="object__body">
          <h1 id="playlist-title" className="title">{info.name}</h1>
          {info.artist && <p className="lead">{info.artist}</p>}
          <p className="muted small num">{counts}</p>
        </div>
        <div className="object__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={!picked.length || !!batch}
            onClick={downloadSelected}
          >
            {batch
              ? `Downloading ${batch.done + 1 > batch.total ? batch.total : batch.done + 1} of ${batch.total}`
              : `Download ${picked.length} as mp3`}
          </button>
          <span className="muted small num">{megabytes(pickedMB)} selected</span>
        </div>
      </header>

      <div className="toolbar">
        <label className="check">
          <input
            type="checkbox"
            checked={allPicked}
            ref={(el) => el && (el.indeterminate = !allPicked && picked.length > 0)}
            onChange={() => setSelected(allPicked ? new Set() : new Set(tracks.map((t) => t.video.id)))}
          />
          Select all
        </label>
        <span className="muted small num">
          {picked.length} of {tracks.length} selected
        </span>
      </div>

      <ol className="tracks">
        {tracks.map((track, i) => (
          <TrackRow
            key={track.video.id}
            track={track}
            index={i}
            checked={selected.has(track.video.id)}
            onToggle={() => toggle(track.video.id)}
            task={tasks[track.video.id] || idle}
            onDownload={() => runTrack(track)}
          />
        ))}
      </ol>

      {unavailable.length > 0 && (
        <>
          <h2 className="section">Couldn't be found on YouTube</h2>
          <ul className="unavailable">
            {unavailable.map((u, i) => (
              <li key={u.id || i}>
                <span>{u.title || u.id || "Unknown video"}</span>
                <span className="muted small">{u.reason}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ---- YouTube search results -------------------------------------------------------

export function SearchView({ query, results, onOpen }) {
  const [openVideo, setOpenVideo] = useState(null);

  if (!results.length) {
    return (
      <section className="panel empty">
        <h1 className="title">Nothing on YouTube for “{query}”</h1>
        <p className="muted">Try fewer words, or paste a link instead.</p>
      </section>
    );
  }

  return (
    <section className="panel" aria-labelledby="search-title">
      <div className="toolbar">
        <h1 id="search-title" className="section">
          YouTube results for “{query}”
        </h1>
        <span className="muted small num">{results.length} videos</span>
      </div>
      <ol className="tracks">
        {results.map((video) => {
          const open = openVideo === video.id;
          return (
            <li key={video.id} className={`track track--search${open ? " is-open" : ""}`}>
              <Cover src={thumbnail(video.id)} className="cover--wide" />
              <div className="track__body">
                <a className="track__title" href={youtubeLink(video.id)} target="_blank" rel="noreferrer">
                  {video.title}
                </a>
                <span className="muted small">{video.uploader}</span>
              </div>
              <span className="track__actions">
                <button type="button" className="btn btn--ghost" onClick={() => onOpen(youtubeLink(video.id))}>
                  Get mp3
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  aria-expanded={open}
                  onClick={() => setOpenVideo(open ? null : video.id)}
                >
                  Video
                </button>
              </span>
              {open && (
                <div className="track__wide">
                  <VideoPicker video={video} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
