import { useEffect, useRef, useState } from "react";

// A long request's state: idle -> busy -> done | exists | failed.
// The API downloads synchronously, so "busy" can last minutes; `started` drives the timer.
export function useTask() {
  const [state, setState] = useState({ status: "idle" });
  const run = async (work) => {
    setState({ status: "busy", started: Date.now() });
    try {
      const result = await work();
      setState({ status: "done", result });
      return true;
    } catch (err) {
      setState(
        err.status === 409
          ? { status: "exists", message: "Already in your library" }
          : { status: "failed", message: err.message },
      );
      return false;
    }
  };
  return [state, run];
}

export function Elapsed({ since }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor((now - since) / 1000));
  return (
    <span className="num">
      {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}
    </span>
  );
}

export const megabytes = (mb) => (mb || mb === 0 ? `${Math.round(mb * 10) / 10} MB` : "–");

export function Cover({ src, alt = "", className = "" }) {
  const [broken, setBroken] = useState(!src);
  return broken ? (
    <span className={`cover cover--empty ${className}`} aria-hidden={!alt} />
  ) : (
    <img className={`cover ${className}`} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
  );
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

const PILLS = {
  busy: "neutral",
  done: "positive",
  exists: "neutral",
  failed: "negative",
};

// The status of a download, as one pill. Idle shows nothing.
export function TaskStatus({ task, doneLabel = "Saved" }) {
  if (task.status === "idle") return null;
  const label = {
    busy: (
      <>
        <Spinner /> Downloading <Elapsed since={task.started} />
      </>
    ),
    done: doneLabel,
    exists: "Already have it",
    failed: "Failed",
  }[task.status];
  return (
    <span className={`pill pill--${PILLS[task.status]}`} title={task.message} role="status">
      {label}
    </span>
  );
}

// Focus an element when it appears (used for panels that open on a click).
export function useAutoFocus() {
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);
  return ref;
}
