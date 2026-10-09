
const NAVIGATION_ENDPOINT = "/api/v1/navigate";

const VALID_MODES = new Set([
  "fastest",
  "balanced",
  "conservative",
]);

/**
 * Build the navigation API URL.
 *
 * Uses a relative URL by default so the frontend can work
 * behind a development proxy or same-origin deployment.
 */
function getNavigationUrl() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  if (!baseUrl) {
    return NAVIGATION_ENDPOINT;
  }

  return `${baseUrl.replace(/\/+$/, "")}${NAVIGATION_ENDPOINT}`;
}

/**
 * Validate a terrain-grid coordinate: [row, col].
 */
function isGridCoordinate(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(
      (coordinate) =>
        Number.isInteger(coordinate) && coordinate >= 0
    )
  );
}

/**
 * Validate the GeoJSON response expected from the backend.
 */
function isRouteGeoJSON(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    data.type === "FeatureCollection" &&
    Array.isArray(data.features) &&
    data.features.every(
      (feature) =>
        feature?.type === "Feature" &&
        feature.geometry?.type === "LineString" &&
        Array.isArray(feature.geometry.coordinates) &&
        feature.geometry.coordinates.every(
          (coordinate) =>
            Array.isArray(coordinate) &&
            coordinate.length === 2 &&
            coordinate.every(Number.isFinite)
        ) &&
        feature.properties !== null &&
        typeof feature.properties === "object"
    )
  );
}

/**
 * Request an optimized Mars route from the backend.
 *
 * @param {{
 *   start: [number, number],
 *   goal: [number, number],
 *   mode?: "fastest" | "balanced" | "conservative",
 *   signal?: AbortSignal
 * }} options
 *
 * @returns {Promise<object>} GeoJSON FeatureCollection
 * @throws {Error} If the request fails or the response is invalid
 */
export async function calculateRoute({
  start,
  goal,
  mode = "balanced",
  signal,
} = {}) {
  if (!isGridCoordinate(start)) {
    throw new TypeError(
      "Invalid start coordinate. Expected [row, col] with non-negative integers."
    );
  }

  if (!isGridCoordinate(goal)) {
    throw new TypeError(
      "Invalid goal coordinate. Expected [row, col] with non-negative integers."
    );
  }

  if (!VALID_MODES.has(mode)) {
    throw new TypeError(
      'Invalid route mode. Use "fastest", "balanced", or "conservative".'
    );
  }

  const response = await fetch(getNavigationUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ start, goal, mode }),
    signal,
  });

  if (!response.ok) {
    let message = `Navigation request failed (${response.status}).`;

    try {
      const errorBody = await response.json();

      if (typeof errorBody.detail === "string") {
        message = errorBody.detail;
      }
    } catch {
      // Keep the HTTP status message if the response isn't JSON.
    }

    throw new Error(message);
  }

  const data = await response.json();

  if (!isRouteGeoJSON(data)) {
    throw new Error(
      "Invalid navigation response: expected a GeoJSON FeatureCollection of LineStrings."
    );
  }

  return data;
}
