import React, { useState, useRef, useContext } from "react";
import { DataContext } from "./dataContext";
import Loader from "./icons/Loader";

const QueryForm = ({ username, error, fetchingUsername }) => {
        const inputRef = useRef();
        const essentialsRef = useRef();
        const [selectedAction, setSelectedAction] = useState("");
        const [isValidInput, setIsValidInput] = useState(true);
        const [isValidEssentialsURL, setIsValidEssentialsURL] = useState(true);
        const [userInput, setUserInput] = useState("");
        const [essentialTracksURL, setEssentialTracksURL] = useState("");
        const [showSingleOnly, setShowSingleOnly] = useState(false);
        const labelStyles =
                "formLabel relative flex justify-center align-center px-4 py-2 border-2 rounded-md gap-2 cursor-pointer transition-all";
        const singleOnlyRef = useRef();
        const [queryStatus, setQueryStatus] = useState("");
        const { setResponseData } = useContext(DataContext);

        const validateInput = (input) => {
                const regex =
                        selectedAction === "search"
                                ? /^[a-zA-Z0-9\s]+ - [a-zA-Z0-9\s]+$/
                                : /^https:\/\/(www\.)?(open\.spotify\.com\/(playlist|artist|track)\/\w+(\?si=\w+)?|(youtube\.com\/(watch\?v=[\w-]+|playlist\?list=[\w-]+(&si=\w+)?)|youtu\.be\/[\w-]+(\?.*)?))$/;
                return regex.test(input);
        };

        const onFormSubmit = async (event) => {
                event.preventDefault();

                if (!validateInput(userInput) && selectedAction !== "saved_tracks") {
                        setIsValidInput(false);
                        inputRef.current.focus();
                        return;
                }

                if (!!essentialTracksURL && !validateInput(essentialTracksURL)) {
                        setIsValidEssentialsURL(false);
                        essentialsRef.current.focus();
                        return;
                }

                const singleOnly = singleOnlyRef.current?.checked;

                const formData = {
                        action: selectedAction,
                        user_input: userInput,
                };

                if (singleOnly) formData.single = true;

                if (selectedAction === "saved_tracks") formData.username = username;

                setQueryStatus("loading");

                // setup request url
                const params = new URLSearchParams({
                        q: userInput,
                        single: !!singleOnly,
                        username,
                        essentials_playlist: essentialTracksURL || "",
                })

                const url = new URL(`http://localhost:5000/query/${selectedAction}`)
                url.search = params.toString()

                try {
                        // Sending a POST request to server with JSON data
                        const queryHandler = await fetch(url);
                        console.log({ queryHandler })

                        const response = await queryHandler.json();
                        setResponseData(response);

                        // save data for persistence
                        localStorage.setItem("metadata", JSON.stringify(response));
                } catch (error) {
                        console.log({ error })
                        setQueryStatus("initial");
                        setUserInput("");
                        setSelectedAction("")
                        setShowSingleOnly(false)
                }
        };

        const onActionChange = (action) => {
                setSelectedAction(action);
                setShowSingleOnly(["download", "search"].includes(action));
                isValidEssentialsURL;
                setIsValidInput(true);
                inputRef.current.focus();
        };

        const placeholder = !selectedAction
                ? "Select action above..."
                : selectedAction === "download"
                        ? "Paste a YouTube or Spotify URL"
                        : "Enter an artist name or artist URL on Spotify";

        return (
                <form
                        onSubmit={onFormSubmit}
                        id="queryData"
                        className="w-5/6 md:w-1/2 border-2 rounded-md flex flex-col gap-4 p-2 md:grid md:place-content-center mx-auto"
                >
                        {queryStatus === "loading" ? (
                                <Loader />
                        ) : (
                                <>
                                        <div className="flex flex-col gap-2">
                                                {/* Radio buttons for download, search, artist */}
                                                <label className={labelStyles}>
                                                        <input
                                                                required
                                                                type="radio"
                                                                name="action"
                                                                value="download"
                                                                onChange={() => onActionChange("download")}
                                                        />{" "}
                                                        <span>Download</span>
                                                </label>
                                                <label className={labelStyles}>
                                                        <input
                                                                required
                                                                type="radio"
                                                                name="action"
                                                                value="search"
                                                                onChange={() => onActionChange("search")}
                                                        />{" "}
                                                        <span>Search</span>
                                                </label>
                                                <label className={labelStyles}>
                                                        <input
                                                                required
                                                                type="radio"
                                                                name="action"
                                                                value="artist"
                                                                onChange={() => onActionChange("artist")}
                                                        />{" "}
                                                        <span>Artist</span>
                                                </label>

                                                {/* Conditionally render username saved tracks */}
                                                {fetchingUsername && (<p>Checking for signed in user</p>)}
                                                {username && (
                                                        <label className={labelStyles}>
                                                                <input
                                                                        required
                                                                        type="radio"
                                                                        name="action"
                                                                        value="saved_tracks"
                                                                        onChange={() => onActionChange("saved_tracks")}
                                                                />{" "}
                                                                <span>{username} Saved Tracks</span>
                                                        </label>
                                                )}
                                        </div>

                                        {/* Input field */}
                                        <input
                                                ref={inputRef}
                                                placeholder={placeholder}
                                                type="text"
                                                id="userInput"
                                                name="user_input"
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                required={selectedAction !== "saved_tracks"}
                                                disabled={!selectedAction}
                                                className={`rounded-md bg-transparent focus:outline-none focus:border-white transition-all border-2 px-4 py-2 ${!isValidInput
                                                        ? "border-red-500 text-red-500"
                                                        : "border-transparent text-white"
                                                        } ${selectedAction === "saved_tracks" ? "hidden" : ""}`}
                                        />

                                        {/* Optional `This Is` playlist url */}
                                        {selectedAction === "artist" && (
                                                <input
                                                        ref={essentialsRef}
                                                        placeholder="Enter the artist's essentials playlist"
                                                        type="url"
                                                        id="essentialTracks"
                                                        name="essential_tracks"
                                                        value={essentialTracksURL}
                                                        onChange={(e) => setEssentialTracksURL(e.target.value)}
                                                        className={`rounded-md bg-transparent focus:outline-none focus:border-white transition-all border-2 px-4 py-2 ${!isValidEssentialsURL
                                                                ? "border-red-500 text-red-500"
                                                                : "border-transparent text-white"
                                                                } ${selectedAction === "saved_tracks" ? "hidden" : ""}`}
                                                />
                                        )}

                                        {(!isValidInput || !isValidEssentialsURL) && (
                                                <p className="text-red-500 text-sm -mt-4">
                                                        {selectedAction === "download"
                                                                ? "Please enter a valid YouTube or Spotify URL"
                                                                : selectedAction === "artist"
                                                                        ? "Please enter a valid Spotify artist URL"
                                                                        : "Please use format `<artist name> - <title name>`"}
                                                </p>
                                        )}

                                        {/* Show 'Download single only' checkbox if 'download' is selected */}
                                        {showSingleOnly && (
                                                <label id="singleOnly" className={labelStyles}>
                                                        <input type="checkbox" ref={singleOnlyRef} defaultChecked />
                                                        <span>Download single only</span>
                                                </label>
                                        )}

                                        {/* Submit button */}
                                        <input value="Submit" type="submit" disabled={!!error} className="formSubmit disabled:cursor-not-allowed" />
                                </>
                        )}
                </form>
        );
};

export default QueryForm;

