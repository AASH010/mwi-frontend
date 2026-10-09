
import RouteModeSelector from "./RouteModeSelector.jsx";
import RouteMetrics from "./RouteMetrics.jsx";
import { marsToGrid } from "../../utils/coordinates.js";

function getGridCell(position) {
  if (
    !Array.isArray(position) ||
    position.length !== 2 ||
    !position.every(Number.isFinite)
  ) {
    return null;
  }

  // Map positions use [Mars Y, Mars X].
  return marsToGrid({
    x: position[1],
    y: position[0],
  });
}

function formatPosition(position) {
  if (
    !Array.isArray(position) ||
    position.length !== 2 ||
    !position.every(Number.isFinite)
  ) {
    return "Not set";
  }

  const [y, x] = position;
  return `X: ${x.toFixed(1)} m, Y: ${y.toFixed(1)} m`;
}

function PositionSummary({ label, position }) {
  const gridCell = getGridCell(position);

  return (
    <div className="navigation-panel__position">
      <h3>{label}</h3>
      <p>{formatPosition(position)}</p>

      {gridCell ? (
        <p>
          Grid cell: row {gridCell[0]}, column {gridCell[1]}
        </p>
      ) : (
        <p>
          {position
            ? "Position is outside the supported terrain grid."
            : "Place this marker on the map first."}
        </p>
      )}
    </div>
  );
}

/**
 * Navigation controls and route results.
 *
 * This component does not fetch data or own navigation state.
 * The parent (App.jsx) supplies state and event handlers.
 *
 * startPosition and goalPosition use [Mars Y, Mars X],
 * in projected metres, matching MarsMap marker positions.
 */
export default function NavigationPanel({
  startPosition = null,
  goalPosition = null,
  routeMode = "balanced",
  onRouteModeChange,
  onCalculateRoute,
  isCalculating = false,
  error = null,
  routeGeoJSON = null,
  className = "",
}) {
  const startCell = getGridCell(startPosition);
  const goalCell = getGridCell(goalPosition);

  const canCalculate =
    startCell !== null &&
    goalCell !== null &&
    !isCalculating &&
    typeof onCalculateRoute === "function";

  return (
    <section
      className={`navigation-panel ${className}`.trim()}
      aria-labelledby="navigation-panel-title"
    >
      <h2 id="navigation-panel-title">Mars Navigation</h2>

      <p>
        Set the start and goal markers on the map, choose a route mode,
        then calculate a route.
      </p>

      <div className="navigation-panel__positions">
        <PositionSummary
          label="Start position"
          position={startPosition}
        />

        <PositionSummary
          label="Goal position"
          position={goalPosition}
        />
      </div>

      <RouteModeSelector
        value={routeMode}
        onChange={onRouteModeChange}
        disabled={isCalculating}
        id="navigation-route-mode"
      />

      <button
        type="button"
        onClick={onCalculateRoute}
        disabled={!canCalculate}
      >
        {isCalculating ? "Calculating route..." : "Calculate route"}
      </button>

      {!startCell || !goalCell ? (
        <p role="status">
          Choose valid start and goal positions inside the terrain grid
          to enable route calculation.
        </p>
      ) : null}

      {error ? (
        <p className="navigation-panel__error" role="alert">
          {error}
        </p>
      ) : null}

      <RouteMetrics routeGeoJSON={routeGeoJSON} />
    </section>
  );
}
