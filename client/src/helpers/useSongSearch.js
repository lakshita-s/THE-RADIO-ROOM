// searches iTunes (free, no key needed) while user types.
// usage: const { results, status } = useSongSearch("mitski");
// results -> a list of { id, title, artist, artwork, previewUrl }
// status  -> "idle" (nothing typed) | "loading" | "done" | "error"
import { useEffect, useState } from "react";

export function useSongSearch(query) {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");

  // runs every time the typed text changes.
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setStatus("idle");
      return undefined;
    }

    setStatus("loading");
    const controller = new AbortController(); // lets us cancel a search that's out of date

    // wait 350ms after the last keystroke so we don't search on every single letter.
    const timer = setTimeout(async () => {
      try {
        const url = `https://itunes.apple.com/search?media=music&entity=song&limit=8&term=${encodeURIComponent(term)}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("search failed");
        const data = await response.json();

        setResults(
          data.results
            .filter((song) => song.previewUrl) // only songs we can actually play
            .map((song) => ({
              id: String(song.trackId),
              title: song.trackName,
              artist: song.artistName,
              artwork: song.artworkUrl100,
              previewUrl: song.previewUrl,
            }))
        );
        setStatus("done");
      } catch (error) {
        if (error.name !== "AbortError") setStatus("error"); // cancelling on purpose isn't an error
      }
    }, 350);

    // if the text changes again, throw this search away.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, status };
}
