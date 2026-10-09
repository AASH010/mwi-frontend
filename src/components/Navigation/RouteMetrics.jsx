
const METRIC_DEFINITIONS = [
  {
    key: "distance_km",
    label: "Distance",
    format: (value) => `${value.toFixed(3)} km`,
  },
  {
    key: "raw_terrain_cost",
    label: "Raw terrain cost",
    format: (value) => value.toFixed(2),
  },
  {
    key: "average_raw_terrain_cost",
    label: "Average terrain cost",
    format: (value) => value.toFixed(4),
  },
  {
    key: "optimization_cost",
    label: "Optimization cost",
    format: (value) => value.toFixed(2),
  },
  {
    key: "average_optimization_cost",
    label: "Average optimization cost",
    format: (value) => value.toFixed(4),
  },
];

const VALID_MODES = new Set([
  "fastest",
  "balanced",
  "conservative",
]);

function isValidMetrics(properties) {
  return (
    properties !== null &&
    typeof properties === "object" &&
    METRIC_DEFINITIONS.every(
      ({ key }) =>
        typeof properties[key] === "number" &&
        Number.isFinite(properties[key])
    ) &&
    VALID_MODES.has(properties.mode)
  );
}

/**
 * Displays metrics from the navigation API response.
 * This component does not calculate routes or fetch data.
 */
export default function RouteMetrics({
  routeGeoJSON = null,
  className = "",
}) {
  const feature = routeGeoJSON?.features?.find(
    (item) =>
      item?.geometry?.type === "LineString" &&
      isValidMetrics(item.properties)
  );

  if (!feature) {
    return (
      <section className={className} aria-live="polite">
        <h2>Route metrics</h2>
        <p>No route metrics available. Calculate a valid route first.</p>
      </section>
    );
  }

  const { properties } = feature;

  return (
    <section className={className} aria-live="polite">
      <h2>Route metrics</h2>

      <p>
        Mode: <strong>{properties.mode}</strong>
      </p>

      <dl>
        {METRIC_DEFINITIONS.map(({ key, label, format }) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{format(properties[key])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
