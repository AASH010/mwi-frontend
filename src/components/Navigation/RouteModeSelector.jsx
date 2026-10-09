
const ROUTE_MODES = [
  {
    value: "fastest",
    label: "Fastest",
    description: "Prioritize travel speed",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Balance speed and terrain cost",
  },
  {
    value: "conservative",
    label: "Conservative",
    description: "Prioritize cautious route planning",
  },
];

/**
 * Route optimization mode selector.
 *
 * This component only manages mode selection UI.
 * The parent component owns the selected value and API calls.
 */
export default function RouteModeSelector({
  value = "balanced",
  onChange,
  disabled = false,
  id = "route-mode",
  className = "",
}) {
  const selectedMode = ROUTE_MODES.some(
    (mode) => mode.value === value
  )
    ? value
    : "balanced";

  return (
    <div className={className}>
      <label htmlFor={id}>Route mode</label>

      <select
        id={id}
        name="routeMode"
        value={selectedMode}
        disabled={disabled}
        onChange={(event) => {
          onChange?.(event.target.value);
        }}
        aria-describedby={`${id}-description`}
      >
        {ROUTE_MODES.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label}
          </option>
        ))}
      </select>

      <p id={`${id}-description`}>
        {
          ROUTE_MODES.find(
            (mode) => mode.value === selectedMode
          )?.description
        }
      </p>
    </div>
  );
}
