import { useEffect, useState } from "react";
import { api } from "./api";
import { megabytes, Spinner, TaskStatus, useTask } from "./ui";

// Lists a video's resolutions, highest first, and downloads the one picked as mp4.
export default function VideoPicker({ video }) {
  const [options, setOptions] = useState({ status: "loading" });
  const [picked, setPicked] = useState(null);
  const [task, run] = useTask();

  const load = () => {
    setOptions({ status: "loading" });
    api
      .resolutions(video)
      .then((byLabel) =>
        setOptions({
          status: "ready",
          list: Object.values(byLabel).sort((a, b) => b.height - a.height),
        }),
      )
      .catch((err) => setOptions({ status: "failed", message: err.message }));
  };
  useEffect(load, [video.id]);

  const download = (resolution) => {
    setPicked(resolution.format_id);
    run(() => api.downloadVideo(video, resolution));
  };

  if (options.status === "loading") {
    return (
      <div className="picker picker--note">
        <Spinner /> Checking which resolutions YouTube has for this video…
      </div>
    );
  }

  if (options.status === "failed") {
    return (
      <div className="picker picker--note">
        <span className="pill pill--negative">Couldn't list resolutions</span>
        <span className="muted">{options.message}</span>
        <button type="button" className="btn btn--ghost" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  if (!options.list.length) {
    return <div className="picker picker--note muted">YouTube offers no video formats for this one.</div>;
  }

  const busy = task.status === "busy";

  return (
    <div className="picker">
      <table className="formats">
        <caption className="visually-hidden">Video resolutions for {video.title}</caption>
        <thead>
          <tr>
            <th scope="col">Resolution</th>
            <th scope="col">Format</th>
            <th scope="col" className="right">Size</th>
            <th scope="col">
              <span className="visually-hidden">Download</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {options.list.map((r) => {
            const isPicked = picked === r.format_id;
            return (
              <tr key={r.format_id} className={isPicked ? "is-picked" : undefined}>
                <th scope="row" className="num">
                  {r.height}p{r.fps > 30 ? <span className="muted"> {r.fps}fps</span> : null}
                </th>
                <td className="muted">mp4{r.ext !== "mp4" ? ` (from ${r.ext})` : ""}</td>
                <td className="right num">{megabytes(r.filesize_mb)}</td>
                <td className="right">
                  {isPicked && task.status !== "idle" && task.status !== "failed" ? (
                    <TaskStatus task={task} />
                  ) : (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      disabled={busy}
                      onClick={() => download(r)}
                      aria-label={`Download ${r.height}p`}
                    >
                      {isPicked && task.status === "failed" ? "Retry" : "Download"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {task.status === "done" && (
        <p className="saved">
          Saved to <code>{task.result.file}</code>
        </p>
      )}
      {task.status === "failed" && <p className="error-line">{task.message}</p>}
    </div>
  );
}
