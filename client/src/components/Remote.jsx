// the buttons on the remote; `label` = text, `onClick` = what happens when pressed.
function ControlButton({ label, onClick }) {
  return (
    <button type="button" className="control-btn" onClick={onClick}>
      {label}
    </button>
  );
}

// the remote control with four buttons.
export default function Remote({ onColors, onPlant, onPosters, onLamp }) {
  return (
    <div className="remote">
      <div className="remote-buttons">
        <ControlButton label="Change Colors" onClick={onColors} />
        <ControlButton label="Change Lamp" onClick={onLamp} />
        <ControlButton label="Change Plant" onClick={onPlant} />
        <ControlButton label="Add Posters" onClick={onPosters} />
      </div>
    </div>
  );
}
