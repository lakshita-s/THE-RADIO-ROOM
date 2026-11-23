import { useState } from "react";
import QueueItem from "./QueueItem.jsx";
import { useSongSearch } from "../helpers/useSongSearch.js";

export default function QueuePanel({ nowPlaying, queue, onSkip, onAdd }) {
  const [text, setText] = useState(""); // what's typed in the search box
  const { results, status } = useSongSearch(text);
  const term = text.trim();
  const searching = term !== "";

  // add a song to the queue, then clear the search box
  const add = (song) => {
    onAdd(song);
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && results[0]) add(results[0]); // enter adds the top result
  };

  return (
    <aside className="queue-panel">
      <h2 className="queue-header">Up Next</h2>

      <div className="queue-search">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search a song…"
          maxLength={100}
          aria-label="Search for a song to add"
        />
        {searching && (
          <button type="button" className="queue-search-clear" onClick={() => setText("")} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      <ul className="queue-list">
        {searching ? (
          <>
            {status === "loading" && <li className="queue-note">Searching…</li>}
            {status === "error" && <li className="queue-note">Search is unavailable right now.</li>}
            {status === "done" && results.length === 0 && <li className="queue-note">No songs found.</li>}

            {results.map((song) => (
              <li key={song.id}>
                <button type="button" className="search-result" onClick={() => add(song)}>
                  {song.artwork && <img src={song.artwork} alt="" width="32" height="32" />}
                  <span className="search-text">
                    <b>{song.title}</b>
                    <i>{song.artist}</i>
                  </span>
                </button>
              </li>
            ))}
          </>
        ) : (
          <>
            {!nowPlaying && queue.length === 0 && (
              <li className="queue-empty">Nothing queued yet.</li>
            )}
            {nowPlaying && <QueueItem now title={nowPlaying.title} artist={nowPlaying.artist} />}
            {queue.map((song) => (
              <QueueItem key={song.id} title={song.title} artist={song.artist} />
            ))}
          </>
        )}
      </ul>

      {nowPlaying && (
        <button type="button" className="queue-skip" onClick={onSkip}>
          Skip
        </button>
      )}
    </aside>
  );
}
