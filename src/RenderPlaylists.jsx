import React, { useContext, useState, forwardRef } from "react";
import SubmitButton from "./SubmitButton";
import { DataContext } from "./dataContext";
import DisplayPlaylist from "./DisplayPlaylist";
import Loader from "./icons/Loader";

const RenderPlaylists = forwardRef((_, ref) => {
  const { responseData } = useContext(DataContext);

  const [downloadStatus, setDownloadStatus] = useState({
    status: "initial",
    message: "",
  });

  // set playlist based on action
  const playlist =
    responseData.action === "artist"
      ? responseData.albums
        .map(({ playlist }) => playlist)
        .reduce((all_tracks, album) => [...all_tracks, ...album], [])
      : responseData.playlist;

  const mapData = (uncheck, album, toggleAlbum) => {
    const newState = toggleAlbum
      ? selectedSongs
      : Object.fromEntries(
        playlist.map(([title, metadata, size]) => [
          title,
          uncheck ? null : { ...metadata, size },
        ]),
      );
    let updatedAlbum = {};

    if (!!album) {
      updatedAlbum = Object.fromEntries(
        album.map(([title, metadata, size]) => [
          title,
          !!selectedSongs[title] ? null : { ...metadata, size },
        ]),
      );
    }

    return { ...newState, ...updatedAlbum };
  };
  const [selectedSongs, setSelectedSongs] = useState(mapData());

  // track first checkbox
  const firstCheckboxTitle = playlist[0][0];
  const firstBoxIsChecked = !!selectedSongs[firstCheckboxTitle];

  const handleCheckboxChange = (title, metadata) => {
    setSelectedSongs((state) => ({
      ...state,
      [title]: !!state[title] ? null : metadata,
    }));
  };

  const toggleAll = (e) => {
    e.preventDefault();
    setSelectedSongs(firstBoxIsChecked ? mapData(true) : mapData());
  };

  const handleSubmit = async () => {
    console.log(process.env.REACT_APP_ENOVIRON)
    const selected_songs = Object.values(selectedSongs)
      .filter(Boolean)
      .map(({ size, ...metadata }) => metadata);
    const playlist_name = responseData.data.name;
    const artist = responseData.action === "artist";

    setDownloadStatus({
      status: "loading",
      message: "Downloading playlist...",
    });

    try {
      const req = await fetch(
        `http://localhost:5000/download/${responseData.action}${artist ? "?artist=true" : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ selected_songs, playlist_name }),
        },
      );

      const res = await req.json();
      setDownloadStatus({ message: res.message, status: "success" });
    } catch (e) {
      if (e instanceof TypeError) {
        setDownloadStatus({ message: "", status: "initial" });
      } else console.log({ e });
    }
  };

  if (downloadStatus.status === "success") {
    return (
      <div className="h-full flex flex-col gap-2">
        <strong className="mb-1">
          Download finished with the following results:
        </strong>
        {downloadStatus.message.map((message) => (
          <p>{message}</p>
        ))}
      </div>
    );
  }

  if (downloadStatus.status === "loading") {
    return (
      <div className="text-center h-full grid place-content-center">
        <Loader />
        <p>Downloading playlist: {responseData.data.name}</p>
      </div>
    );
  }

  if (downloadStatus.status === "success") {
    return (
      <div>
        <p>{downloadStatus.message}</p>
      </div>
    );
  }

  if (responseData.action === "artist") {
    return (
      <div className="flex flex-col gap-2 px-4">
        {responseData.albums.map(({ album, playlist }) => {
          const { artist, cover, name } = album;
          const allSelected = playlist.every(
            ([title]) => !!selectedSongs[title],
          );
          const borderStyles = allSelected
            ? "border-rose-500 hover:border-white"
            : "border-white hover:border-rose-500";

          return (
            <div
              className={`${borderStyles} border-2 rounded-md px-6 py-4 cursor-pointer transition-color`}
              onClick={() => setSelectedSongs(mapData(null, playlist, true))}
            >
              <div className="text-center p-4">
                <img
                  className="rounded-md mx-auto"
                  src={cover}
                  alt="Cover image"
                  width={80}
                  height={80}
                />
                <p>
                  {artist} - {name}
                </p>
              </div>

              <DisplayPlaylist
                borderStyles={borderStyles}
                isAlbum={true}
                selectedSongs={selectedSongs}
                playlist={playlist}
                handleCheckboxChange={handleCheckboxChange}
              />
            </div>
          );
        })}

        <DownloadPlaylistButton
          ref={ref}
          handleSubmit={handleSubmit}
          selectedSongs={selectedSongs}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <DisplayPlaylist
        selectedSongs={selectedSongs}
        playlist={playlist}
        handleCheckboxChange={handleCheckboxChange}
      >
        Playlist
      </DisplayPlaylist>

      <button className="formSubmit" onClick={(e) => toggleAll(e)}>
        {firstBoxIsChecked ? "Deselect all" : "Select all"}
      </button>

      <SubmitButton
        size={Object.values(selectedSongs).reduce(
          (sum, metadata) => metadata?.size || 0 + sum,
          0,
        )}
        handleSubmit={() => { }}
        totalTracks={Object.values(selectedSongs).reduce(
          (sum, track) => (!!track ? sum + 1 : sum),
          0,
        )}
      />
    </div>
  );
});

export default RenderPlaylists;

const DownloadPlaylistButton = forwardRef(
  ({ selectedSongs, handleSubmit }, ref) => (
    <SubmitButton
      size={Object.values(selectedSongs).reduce(
        (sum, metadata) => (metadata?.size || 0) + sum,
        0,
      )}
      handleSubmit={handleSubmit}
      totalTracks={Object.values(selectedSongs).reduce(
        (sum, track) => (!!track ? sum + 1 : sum),
        0,
      )}
      ref={ref}
    />
  ),
);

