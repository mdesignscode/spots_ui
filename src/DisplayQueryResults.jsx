import React, { useContext, useState, useRef } from "react";
import { DataContext } from "./dataContext";
import DisplaySingle from "./DisplaySingle";
import DisplayPlaylist from "./DisplayPlaylist";
import HouseIcon from "./icons/HouseIcon";
import ToBottomIcon from "./icons/ToBottomIcon";
import SubmitButton from "./SubmitButton";
import RenderPlaylists from "./RenderPlaylists";

export default function DisplayQueryResults() {
  // grap data from context
  const { responseData, setResponseData } = useContext(DataContext);

  const scrollDownRef = useRef();

  // check if resource is single only
  const isSingleOnly =
    responseData.resource === "single" &&
    !responseData.recommended_tracks.length;

  const handleRefresh = () => {
    setResponseData(null);
    localStorage.removeItem("metadata");
  };

  const handleScrollDown = () =>
    scrollDownRef.current.scrollIntoView({
      behavior: "smooth",
    });

  return (
    <main className="h-[100dvh] px-4 py-2 bg-gradient-to-b from-emerald-600 to-dark flex flex-col gap-2 md:flex-row relative">
      <button onClick={handleRefresh} className="absolute top-4 left-4 h-fit">
        <HouseIcon />
      </button>
      {!isSingleOnly && (
        <button
          onClick={handleScrollDown}
          className="absolute top-4 left-14 h-fit"
        >
          <ToBottomIcon />
        </button>
      )}
      {!isSingleOnly && (
        <section className="w-2/3 md:w-1/3 md:h-fit md:p-8 mx-auto flex flex-col items-center justify-center p-2 border-2 text-center border-white rounded-md gap-1 my-auto">
          <img
            className="rounded-md"
            src={
              responseData.resource === "saved_tracks"
                ? `http://localhost:5000/${responseData.data.cover}`
                : responseData.data.cover
            }
            alt="Playlist cover"
            width={100}
            height={100}
          />
          <h1 className="text-xl sm:text-2xl break-words w-full">
            {responseData.data.name}
          </h1>
        </section>
      )}
      <form
        className={`${isSingleOnly ? "w-full h-full" : ""} overflow-y-auto flex-1`}
      >
        {responseData.resource === "single" ? (
          <DisplaySingle />
        ) : (
          <RenderPlaylists ref={scrollDownRef} />
        )}
      </form>
    </main>
  );
}
