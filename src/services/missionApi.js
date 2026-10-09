
const MISSION_CONSUMABLES_ENDPOINT =
  "/api/v1/mission/consumables";

function getMissionUrl() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  if (!baseUrl) {
    return MISSION_CONSUMABLES_ENDPOINT;
  }

  return `${baseUrl.replace(/\/+$/, "")}${MISSION_CONSUMABLES_ENDPOINT}`;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validateRequest(payload) {
  if (!payload || typeof payload !== "object") {
    throw new TypeError("Mission parameters must be an object.");
  }

  if (!isFiniteNumber(payload.distance_km) || payload.distance_km <= 0) {
    throw new TypeError("distance_km must be a number greater than zero.");
  }

  if (
    !isFiniteNumber(payload.average_raw_terrain_cost) ||
    payload.average_raw_terrain_cost < 0
  ) {
    throw new TypeError(
      "average_raw_terrain_cost must be a non-negative number."
    );
  }

  const constraints = [
    ["average_slope_percent", (value) => value >= 0],
    ["payload_kg", (value) => value >= 0],
    ["base_walking_speed_ms", (value) => value > 0],
    ["suit_capacity_hours", (value) => value > 0],
  ];

  for (const [field, isValid] of constraints) {
    if (
      payload[field] !== undefined &&
      payload[field] !== null &&
      (!isFiniteNumber(payload[field]) || !isValid(payload[field]))
    ) {
      throw new TypeError(`Invalid mission parameter: ${field}.`);
    }
  }
}

function isConsumablesResponse(data) {
  const numericFields = [
    "estimated_duration_hours",
    "estimated_oxygen_liters",
    "oxygen_percent_of_suit_capacity",
    "average_metabolic_rate_kcal_hr",
    "slope_penalty_kcal_hr",
    "payload_penalty_kcal_hr",
    "safety_margin_hours",
  ];

  return (
    data !== null &&
    typeof data === "object" &&
    numericFields.every((field) => isFiniteNumber(data[field])) &&
    data.assumptions !== null &&
    typeof data.assumptions === "object"
  );
}

/**
 * Estimate mission duration and consumables.
 *
 * @param {{
 *   distance_km: number,
 *   average_raw_terrain_cost: number,
 *   average_slope_percent?: number,
 *   payload_kg?: number,
 *   base_walking_speed_ms?: number,
 *   suit_capacity_hours?: number
 * }} payload
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<object>}
 */
export async function estimateMissionConsumables(
  payload,
  { signal } = {}
) {
  validateRequest(payload);

  const response = await fetch(getMissionUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let message = `Mission calculation failed (${response.status}).`;

    try {
      const errorBody = await response.json();

      if (typeof errorBody.detail === "string") {
        message = errorBody.detail;
      }
    } catch {
      // Retain the HTTP status message for non-JSON errors.
    }

    throw new Error(message);
  }

  const data = await response.json();

  if (!isConsumablesResponse(data)) {
    throw new Error(
      "Invalid mission response: required consumables fields are missing or invalid."
    );
  }

  return data;
}
