
import { useEffect, useState } from "react";
import ConsumablesPanel from "./ConsumablesPanel.jsx";

/**
 * Mission dashboard.
 *
 * Receives route data from the parent and coordinates consumables
 * form state. The parent remains responsible for API requests.
 */
export default function MissionDashboard({
  routeGeoJSON = null,
  onCalculateConsumables,
  consumablesResult = null,
  isCalculating = false,
  error = null,
  className = "",
}) {
  const [values, setValues] = useState({
    distance_km: "",
    average_raw_terrain_cost: "",
    average_slope_percent: "",
    payload_kg: "0",
    base_walking_speed_ms: "0.35",
    suit_capacity_hours: "8.5",
  });

  const routeProperties =
    routeGeoJSON?.features?.find(
      (feature) =>
        feature?.geometry?.type === "LineString" &&
        Number.isFinite(feature?.properties?.distance_km) &&
        feature.properties.distance_km > 0 &&
        Number.isFinite(
          feature?.properties?.average_raw_terrain_cost
        ) &&
        feature.properties.average_raw_terrain_cost >= 0
    )?.properties ?? null;

  useEffect(() => {
    if (!routeProperties) {
      setValues((current) => ({
        ...current,
        distance_km: "",
        average_raw_terrain_cost: "",
        average_slope_percent: "",
      }));
      return;
    }

    setValues((current) => ({
      ...current,
      distance_km: String(routeProperties.distance_km),
      average_raw_terrain_cost: String(
        routeProperties.average_raw_terrain_cost
      ),
    }));
  }, [routeProperties?.distance_km, routeProperties?.average_raw_terrain_cost]);

  function handleChange(name, value) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCalculate(payload) {
    if (typeof onCalculateConsumables !== "function") {
      return;
    }

    onCalculateConsumables(payload);
  }

  const hasRoute = routeProperties !== null;

  return (
    <section
      className={`mission-dashboard ${className}`.trim()}
      aria-labelledby="mission-dashboard-title"
    >
      <header className="mission-dashboard__header">
        <h2 id="mission-dashboard-title">Mission Dashboard</h2>
        <p>
          Review route information and estimate mission duration
          and consumables.
        </p>
      </header>

      <section
        className="mission-dashboard__route"
        aria-labelledby="mission-route-title"
      >
        <h3 id="mission-route-title">Selected route</h3>

        {!hasRoute ? (
          <p role="status">
            Calculate a valid route before estimating mission
            consumables.
          </p>
        ) : (
          <dl>
            <div>
              <dt>Route mode</dt>
              <dd>{routeProperties.mode ?? "Not specified"}</dd>
            </div>

            <div>
              <dt>Distance</dt>
              <dd>{routeProperties.distance_km.toFixed(3)} km</dd>
            </div>

            <div>
              <dt>Average terrain cost</dt>
              <dd>
                {routeProperties.average_raw_terrain_cost.toFixed(4)}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <ConsumablesPanel
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        result={consumablesResult}
        isCalculating={isCalculating}
        error={error}
        disabled={!hasRoute}
      />
    </section>
  );
}
