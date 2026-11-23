// a song in the list. `now` is true for the song that's playing right now.
export default function QueueItem({ title, artist, now }) {
  return (
    <li className={`queue-item${now ? " now" : ""}`}>
      {now && <span className="queue-tag">Now playing</span>}
      <span className="queue-title">{title}</span>
      {artist && <span className="queue-artist">{artist}</span>}
    </li>
  );
}
