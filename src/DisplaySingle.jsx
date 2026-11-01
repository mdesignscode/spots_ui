import React, { useState, useContext } from "react";
import SubmitButton from "./SubmitButton";
import Loader from "./icons/Loader";
import { DataContext } from "./dataContext";

export default function DisplaySingle() {
        const [reqStatus, setReqStatus] = useState({
                status: "initial",
                message: "",
        });
        const { video_info, metadata, youtube_title } = useContext(DataContext).responseData;

        async function downloadSingle() {
                try {
                        // display loader
                        setReqStatus({
                                status: "loading",
                                message: `Downloading ${youtube_title}`,
                        });

                        // download song
                        const request = await fetch("http://localhost:5000/download/single", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ ...metadata, ...video_info }),
                        });

                        // display result
                        const result = await request.json();
                        console.log({ result })
                        setReqStatus({
                                status: "success",
                                message: result.message,
                        });
                } catch (e) {
                        console.log({ error: e })
                        setReqStatus({
                                status: "initial",
                                message: "",
                        })
                }
        }

        return (
                <section className="w-full h-full grid place-content-center">
                        <img
                                className="rounded-md mx-auto"
                                src={metadata.cover}
                                alt="Playlist cover"
                                width={150}
                                height={150}
                        />
                        <div className="text-center mt-4">
                                {reqStatus.status === "initial" ? (
                                        <>
                                                <p>{youtube_title}</p>
                                                <SubmitButton size={video_info.filesize} title="Download" handleSubmit={downloadSingle} />
                                        </>
                                ) : reqStatus.status === "loading" ? (
                                        <>
                                                <Loader size={10} />
                                                <p>{reqStatus.message}</p>
                                        </>
                                ) : (
                                        <a href="#" onClick={() => window.location.reload()}>{reqStatus.message}</a>
                                )}
                        </div>
                </section>
        );
}

