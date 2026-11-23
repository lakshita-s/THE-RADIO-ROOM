// the 3x3 grid of poster frames
// `posters` is a list of image links (or null for empty frames).
export default function PosterWall({ posters, onClear }) {
  return (
    <div className="poster-wall">
      {posters.map((src, i) => (
        <div key={i} className={`poster-slot ${src ? "filled" : "empty"}`}>
          {src ? (
            <img src={src} alt="" draggable={false} />
          ) : (
            <span className="plus" aria-hidden="true"></span>
          )}

          {src && (
            <button
              type="button"
              className="poster-clear"
              onClick={() => onClear(i)}
              aria-label="Remove poster"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
