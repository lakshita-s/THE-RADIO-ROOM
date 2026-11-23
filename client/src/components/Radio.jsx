// the radio image is also a play button: clicking it starts/stops the sound.
export default function Radio({ tunedIn, onToggle }) {
  return (
    <button
      type="button"
      className="radio"
      onClick={onToggle}
      aria-label={tunedIn ? "Turn radio off" : "Turn radio on"}
    >
      <img src="/assets/radio.png" alt="radio"/>
    </button>
  );
}
