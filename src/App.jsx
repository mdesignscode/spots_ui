import { useEffect, useRef, useState } from "react";
import { api, isLink } from "./api";
import { Spinner } from "./ui";
import { PlaylistView, SearchView, SingleView } from "./views";

function Mark() {
  // two sound waves meeting at a dot: Spots
  return (
    <svg className="mark" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
      <circle cx="14" cy="14" r="4" fill="currentColor" />
      <path d="M6 7a10 10 0 0 0 0 14M22 7a10 10 0 0 1 0 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function ApiStatus() {
  const [state, setState] = useState("checking");
  const check = () => {
    setState("checking");
    api.status().then(() => setState("up"), () => setState("down"));
  };
  useEffect(check, []);

  if (state === "down") {
    return (
      <div className="api-status">
        <span className="pill pill--negative">API offline</span>
        <button type="button" className="btn btn--ghost" onClick={check}>
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="api-status muted small" role="status">
      {state === "up" ? (
        <>
          <span className="dot" aria-hidden="true" /> API connected
        </>
      ) : (
        "Checking API…"
      )}
    </div>
  );
}

const EXAMPLES = [
  ["A Spotify track, album or playlist", "https://open.spotify.com/track/…"],
  ["A YouTube video or playlist", "https://www.youtube.com/watch?v=…"],
  ["Search terms, to find a YouTube video", "Tyla That Girl"],
];

export default function App() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState({ kind: "start" });
  const inputRef = useRef(null);

  const submit = async (value) => {
    const q = value.trim();
    if (!q) return;
    setQuery(q);
    setView({ kind: "loading", q });
    try {
      if (isLink(q)) {
        const resource = await api.resolve(q);
        setView({ kind: resource.resource_type, q, resource });
      } else {
        const { results } = await api.search(q);
        setView({ kind: "search", q, results });
      }
    } catch (err) {
      setView({ kind: "error", q, message: err.message });
    }
  };

  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Spots, start over">
          <Mark />
          <span>Spots</span>
        </a>
        <form
          className="query"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
        >
          <label htmlFor="q" className="visually-hidden">
            Paste a Spotify or YouTube link, or search YouTube
          </label>
          <input
            id="q"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a Spotify or YouTube link, or search YouTube"
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit" className="btn btn--primary" disabled={!query.trim() || view.kind === "loading"}>
            {isLink(query) ? "Open" : "Search"}
          </button>
        </form>
        <ApiStatus />
      </header>

      <main className="content">
        {view.kind === "start" && (
          <section className="panel empty">
            <h1 className="title">Download music and video from a link</h1>
            <p className="muted">
              Spots matches songs to YouTube, then saves them as tagged mp3s, or as mp4 video at the resolution you
              pick. Files go to your Downloads folder.
            </p>
            <ul className="examples">
              {EXAMPLES.map(([label, sample]) => (
                <li key={label}>
                  <span>{label}</span>
                  <code className="muted">{sample}</code>
                </li>
              ))}
            </ul>
          </section>
        )}

        {view.kind === "loading" && (
          <section className="panel empty" aria-busy="true">
            <p className="loading">
              <Spinner />{" "}
              {isLink(view.q)
                ? "Matching the tracks to YouTube. Long playlists take a while."
                : `Searching YouTube for “${view.q}”`}
            </p>
          </section>
        )}

        {view.kind === "error" && (
          <section className="panel empty">
            <h1 className="title">Couldn't open that</h1>
            <p className="error-line">{view.message}</p>
            <div className="row">
              <button type="button" className="btn btn--ghost" onClick={() => submit(view.q)}>
                Try again
              </button>
            </div>
          </section>
        )}

        {view.kind === "single" && <SingleView key={view.q} resource={view.resource} />}
        {view.kind === "playlist" && <PlaylistView key={view.q} resource={view.resource} />}
        {view.kind === "search" && (
          <SearchView key={view.q} query={view.q} results={view.results} onOpen={submit} />
        )}
      </main>
    </div>
  );
}
