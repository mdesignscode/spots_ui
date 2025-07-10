import React, { useState, useEffect } from "react";
import QueryForm from "./QueryForm";
import FeedbackMessage from "./FeedbackMessage";

export default function Home() {
        const [fetchingUsername, setFetchingUsername] = useState(false);
        const [username, setUsername] = useState("");
        const [error, setError] = useState("")

        async function getUsername() {
                try {
                        setFetchingUsername(true);
                        setError("");
                        url = process.env.REACT_APP_API_URL;
                        const req = await fetch(`${url}get-user`);
                        const res = await req.json()
                        setFetchingUsername(false);
                        setUsername(res.username);
                } catch (e) {
                        if (e instanceof TypeError) {
                                setFetchingUsername(false);
                                setError("Please start server and try again.")
                        }
                }
        }

        useEffect(() => {
                getUsername()
        }, [])

        return <main className="bg-gradient-to-b from-indigo-900 via-emerald-800 flex flex-col align-center px-4 md:px-12 py-10 md:py-14 to-rose-900 md:text-xl gap-6 overflow-y-auto h-full">
                <section className="text-center">
                        <h1>Spots</h1>
                        <h2>Convert YouTube or Spotify urls to mp3</h2>
                </section>

                <QueryForm fetchingUsername={fetchingUsername} username={username} error={error} />

                {error && <FeedbackMessage message={error} onRetry={getUsername} type="error" />}
        </main>
}

