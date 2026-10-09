function formatCoordinate(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} m` : "—";
}

function formatNumber(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function getRouteProperties(routeGeoJSON) {
  if (
    routeGeoJSON?.type !== "FeatureCollection" ||
    !Array.isArray(routeGeoJSON.features)
  ) {
    return null;
  }

  const feature = routeGeoJSON.features.find(
    (item) =>
      item?.geometry?.type === "LineString" &&
      Array.isArray(item.geometry.coordinates) &&
      item.geometry.coordinates.length >= 2 &&
      item.properties &&
      Number.isFinite(item.properties.distance_km)
  );

  return feature?.properties ?? null;
}

/**
 * MarsWalk Intelligence Heads-Up Display.
 *
 * Displays navigation status, route information, marker coordinates,
 * and mission consumables estimates.
 *
 * This component is presentational only. It does not call APIs
 * or own the application's navigation state.
 *
 * Map positions use [Mars Y, Mars X], in projected metres.
 */
export default function HUD({
  startPosition = null,
  goalPosition = null,
  routeGeoJSON = null,
  isCalculatingRoute = false,
  routeError = null,
  missionResult = null,
  isCalculatingMission = false,
  missionError = null,
  className = "",
}) {
  const route = getRouteProperties(routeGeoJSON);

  const hasPosition = (position) =>
    Array.isArray(position) &&
    position.length === 2 &&
    position.every(Number.isFinite);

  const formatPosition = (position) => {
    if (!hasPosition(position)) {
      return "Not set";
    }

    const [y, x] = position;

    return `X ${formatCoordinate(x)} · Y ${formatCoordinate(y)}`;
  };

  let navigationStatus = "Waiting for route";

  if (isCalculatingRoute) {
    navigationStatus = "Calculating route";
  } else if (routeError) {
    navigationStatus = "Route calculation failed";
  } else if (route) {
    navigationStatus = "Route ready";
  }

  let missionStatus = "Awaiting estimate";

  if (isCalculatingMission) {
    missionStatus = "Calculating estimate";
  } else if (missionError) {
    missionStatus = "Estimate failed";
  } else if (missionResult) {
    missionStatus = "Estimate ready";
  }

  return (
    <aside
      className={`hud ${className}`.trim()}
      aria-label="Mission status display"
    >
      <header className="hud__header">
        <div>
          <p className="hud__eyebrow">MARSWALK INTELLIGENCE</p>
          <h2 className="hud__title">Mission HUD</h2>
        </div>

        <span
          className={`hud__status ${
            route ? "hud__status--ready" : "hud__status--pending"
          }`}
          role="status"
        >
          {navigationStatus}
        </span>
      </header>

      <section
        className="hud__section"
        aria-labelledby="hud-position-title"
      >
        <h3 id="hud-position-title">Navigation</h3>

        <dl className="hud__details">
          <div>
            <dt>Start</dt>
            <dd>{formatPosition(startPosition)}</dd>
          </div>

          <div>
            <dt>Goal</dt>
            <dd>{formatPosition(goalPosition)}</dd>
          </div>

          <div>
            <dt>Route mode</dt>
            <dd>{route?.mode ?? "—"}</dd>
          </div>

          <div>
            <dt>Distance</dt>
            <dd>
              {route
                ? `${formatNumber(route.distance_km, 3)} km`
                : "—"}
            </dd>
          </div>

          <div>
            <dt>Average terrain cost</dt>
            <dd>
              {route
                ? formatNumber(route.average_raw_terrain_cost, 4)
                : "—"}
            </dd>
          </div>
        </dl>

        {routeError ? (
          <p className="hud__error" role="alert">
            {routeError}
          </p>
        ) : null}
      </section>

      <section
        className="hud__section"
        aria-labelledby="hud-mission-title"
      >
        <div className="hud__section-heading">
          <h3 id="hud-mission-title">Mission resources</h3>
          <span>{missionStatus}</span>
        </div>

        <dl className="hud__details">
          <div>
            <dt>Estimated duration</dt>
            <dd>
              {formatNumber(
                missionResult?.estimated_duration_hours
              )}{" "}
              h
            </dd>
          </div>

          <div>
            <dt>Estimated oxygen</dt>
            <dd>
              {formatNumber(
                missionResult?.estimated_oxygen_liters,
                1
              )}{" "}
              L
            </dd>
          </div>

          <div>
            <dt>Suit capacity used</dt>
            <dd>
              {formatNumber(
                missionResult?.oxygen_percent_of_suit_capacity,
                1
              )}
              %
            </dd>
          </div>

          <div>
            <dt>Safety margin</dt>
            <dd>
              {formatNumber(
                missionResult?.safety_margin_hours
              )}{" "}
              h
            </dd>
          </div>
        </dl>

        {missionError ? (
          <p className="hud__error" role="alert">
            {missionError}
          </p>
        ) : null}
      </section>
    </aside>
  );
}
