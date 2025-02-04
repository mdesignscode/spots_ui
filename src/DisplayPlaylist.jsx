import React, { useState } from "react";

export default function DisplayPlaylist({ playlist, selectedSongs, handleCheckboxChange,isAlbum, borderStyles }) {
  return (
    <section className="flex flex-col gap-2">
      {playlist.map((songData) => {
        const [title, metadata, size] = songData;
        const { cover, preview_url, link } = metadata;

        return (
          <label
            key={link}
            className={`${borderStyles || "border-white"} border-2 rounded-md flex flex-col md:flex-row justify-center items-center p-2 gap-2 cursor-pointer`}
          >
            <input
              type="checkbox"
              className="form-checkbox accent-emerald-600 mr-2"
              onChange={() => handleCheckboxChange(title, metadata)}
              checked={!!selectedSongs[title]}
            />
            {!isAlbum && <img
              loading="lazy"
              src={cover}
              width={60}
              height={60}
              alt="Cover image"
              className="md:size-16 rounded-md"
            />}
            <div className="flex flex-col gap-2 justify-center items-center w-full text-center">
              <span className="flex flex-col md:justify-center md:flex-row gap-2">
                <p className="max-w-[90%]">{title}</p>
                <p>({size}MB)</p>
              </span>
              <audio controls className={`${!isAlbum ? "w-full" : "hidden md:block w-[60%]"} rounded-md`}>
                <source src={preview_url} type="audio/mp3" />
              </audio>
            </div>
          </label>
        );
      })}
    </section>
  );
}
