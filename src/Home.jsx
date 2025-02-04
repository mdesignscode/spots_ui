import React, { useState, useEffect } from "react";
import QueryForm from "./QueryForm";

export default function Home() {
  const [username, setUsername] = useState("");
  const [serverOffline, setServerOffline] = useState(false)

  async function getUsername() {
    try {
      const req = await fetch("http://127.0.0.1:5000/get-user");
      const res = await req.json()
      setUsername(res.username);
    } catch (e) {
      if (e instanceof TypeError) {
        setServerOffline(true)
      }
    }
  }

  async function retryServer() {
    setServerOffline(false)
    await getUsername()
  }

  useEffect(() => {
    getUsername()
  }, [])

  return <main className="bg-gradient-to-b from-indigo-900 via-emerald-800 flex flex-col align-center px-4 md:px-12 py-10 md:py-14 to-rose-900 md:text-xl gap-6 overflow-y-auto h-full">
    <section className="text-center">
      <h1>Spots</h1>
      <h2>Convert YouTube or Spotify urls to mp3</h2>
    </section>

    {!serverOffline ? <QueryForm username={username} /> : (
      <div className="mx-auto p-4 border-2 text-center rounded-md">
        <p>Please start server and try again</p>
        <button onClick={retryServer} className="mt-2 border-2 rounded-md p-2">retry</button>
      </div>
    )}
  </main>
}

