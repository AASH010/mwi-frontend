
const INPUTS = [
  {
    name: "distance_km",
    label: "Route distance (km)",
    min: "0.001",
    step: "any",
    required: true,
    description: "Distance of the selected route in kilometres.",
  },
  {
    name: "average_raw_terrain_cost",
    label: "Average terrain cost",
    min: "0",
    step: "any",
    required: true,
    description: "Average raw terrain cost reported by the route.",
  },
  {
    name: "average_slope_percent",
    label: "Average slope (%)",
    min: "0",
    step: "any",
    required: false,
    description: "Optional average slope percentage.",
  },
  {
    name: "payload_kg",
    label: "Payload (kg)",
    min: "0",
    step: "any",
    required: false,
    description: "Optional carried payload in kilograms.",
  },
  {
    name: "base_walking_speed_ms",
    label: "Base walking speed (m/s)",
    min: "0.001",
    step: "any",
    required: false,
    description: "Defaults to 0.35 m/s when omitted.",
  },
  {
    name: "suit_capacity_hours",
    label: "Suit capacity (hours)",
    min: "0.001",
    step: "any",
    required: false,
    description: "Defaults to 8.5 hours when omitted.",
  },
];

const RESULTS = [
  ["estimated_duration_hours", "Estimated duration", "hours"],
  ["estimated_oxygen_liters", "Estimated oxygen", "L"],
  [
    "oxygen_percent_of_suit_capacity",
    "Oxygen capacity used",
    "%",
  ],
  [
    "average_metabolic_rate_kcal_hr",
    "Average metabolic rate",
    "kcal/hr",
  ],
  ["slope_penalty_kcal_hr", "Slope penalty", "kcal/hr"],
  ["payload_penalty_kcal_hr", "Payload penalty", "kcal/hr"],
  ["safety_margin_hours", "Safety margin", "hours"],
];

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

function getInitialFormValues(initialValues) {
  return Object.fromEntries(
    INPUTS.map(({ name }) => [
      name,
      initialValues?.[name] == null
        ? ""
        : String(initialValues[name]),
    ])
  );
}

/**
 * Displays mission consumables inputs and calculation results.
 *
 * The parent owns form values, request state, API calls, and errors.
 */
export default function ConsumablesPanel({
  values,
  onChange,
  onCalculate,
  result = null,
  isCalculating = false,
  error = null,
  disabled = false,
  className = "",
}) {
  const formValues = getInitialFormValues(values);

  const canCalculate =
    !disabled &&
    !isCalculating &&
    typeof onCalculate === "function" &&
    INPUTS.filter((field) => field.required).every(
      ({ name }) =>
        formValues[name] !== "" &&
        Number.isFinite(Number(formValues[name])) &&
        Number(formValues[name]) >= 0
    ) &&
    Number(formValues.distance_km) > 0;

  function handleSubmit(event) {
    event.preventDefault();

    if (!canCalculate) {
      return;
    }

    const payload = {};

    for (const { name, required } of INPUTS) {
      const rawValue = formValues[name];

      if (rawValue === "") {
        if (required) {
          return;
        }
        continue;
      }

      const numericValue = Number(rawValue);

      if (!Number.isFinite(numericValue)) {
        return;
      }

      payload[name] = numericValue;
    }

    onCalculate(payload);
  }

  return (
    <section
      className={`consumables-panel ${className}`.trim()}
      aria-labelledby="consumables-panel-title"
    >
      <h2 id="consumables-panel-title">
        Mission Consumables
      </h2>

      <p>
        Estimate mission duration and oxygen requirements for the
        selected route. These values are planning estimates, not
        guarantees of mission safety.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="consumables-panel__fields">
          {INPUTS.map((field) => (
            <div
              className="consumables-panel__field"
              key={field.name}
            >
              <label htmlFor={`consumables-${field.name}`}>
                {field.label}
                {field.required ? " *" : ""}
              </label>

              <input
                id={`consumables-${field.name}`}
                name={field.name}
                type="number"
                min={field.min}
                step={field.step}
                required={field.required}
                value={formValues[field.name]}
                disabled={disabled || isCalculating}
                onChange={(event) =>
                  onChange?.(field.name, event.target.value)
                }
                aria-describedby={`consumables-${field.name}-help`}
              />

              <p id={`consumables-${field.name}-help`}>
                {field.description}
              </p>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={!canCalculate}
        >
          {isCalculating
            ? "Calculating..."
            : "Estimate consumables"}
        </button>
      </form>

      {error ? (
        <p className="consumables-panel__error" role="alert">
          {error}
        </p>
      ) : null}

      <section
        className="consumables-panel__results"
        aria-live="polite"
        aria-labelledby="consumables-results-title"
      >
        <h3 id="consumables-results-title">
          Estimated results
        </h3>

        {!result ? (
          <p>
            No estimate yet. Enter the route values and calculate
            consumables to see the results.
          </p>
        ) : (
          <>
            <dl>
              {RESULTS.map(([key, label, unit]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>
                    {formatNumber(result[key])} {unit}
                  </dd>
                </div>
              ))}
            </dl>

            {result.assumptions &&
            typeof result.assumptions === "object" ? (
              <details>
                <summary>Calculation assumptions</summary>
                <pre>
                  {JSON.stringify(result.assumptions, null, 2)}
                </pre>
              </details>
            ) : null}
          </>
        )}
      </section>
    </section>
  );
}
