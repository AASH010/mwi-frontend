import { useRef, useState } from "react";

import MarsMap from "./components/MarsMap/MarsMap.jsx";
import HUD from "./components/HUD.jsx";
import ControlPanel from "./components/ControlPanel.jsx";

import { calculateRoute } from "./services/navigationApi.js";
import { estimateMissionConsumables } from "./services/missionApi.js";
import { marsToGrid } from "./utils/coordinates.js";

// Positions use [Mars Y, Mars X] in projected metres.
// Both defaults are centres of valid terrain-grid cells.
const INITIAL_START_POSITION = [1_099_990, 4_350_010];
const INITIAL_GOAL_POSITION = [1_090_010, 4_359_990];

function getGridCell(position) {
  if (
    !Array.isArray(position) ||
    position.length !== 2 ||
    !position.every(Number.isFinite)
  ) {
    return null;
  }

  return marsToGrid({
    x: position[1],
    y: position[0],
  });
}

function getErrorMessage(error, fallback) {
  return error instanceof Error && error.message
    ? error.message
    : fallback;
}

export default function App() {
  const [startPosition, setStartPosition] = useState(
    INITIAL_START_POSITION
  );
  const [goalPosition, setGoalPosition] = useState(
    INITIAL_GOAL_POSITION
  );

  const [routeMode, setRouteMode] = useState("balanced");
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] =
    useState(false);
  const [routeError, setRouteError] = useState(null);

  const [consumablesResult, setConsumablesResult] = useState(null);
  const [isCalculatingMission, setIsCalculatingMission] =
    useState(false);
  const [missionError, setMissionError] = useState(null);

  // Prevent an older mission response from replacing newer state.
  const missionRequestId = useRef(0);

  function invalidateMissionEstimate() {
    missionRequestId.current += 1;
    setConsumablesResult(null);
    setIsCalculatingMission(false);
    setMissionError(null);
  }

  function handleStartPositionChange(position) {
    setStartPosition(position);
    setRouteGeoJSON(null);
    setRouteError(null);
    invalidateMissionEstimate();
  }

  function handleGoalPositionChange(position) {
    setGoalPosition(position);
    setRouteGeoJSON(null);
    setRouteError(null);
    invalidateMissionEstimate();
  }

  function handleRouteModeChange(mode) {
    setRouteMode(mode);
    setRouteGeoJSON(null);
    setRouteError(null);
    invalidateMissionEstimate();
  }

  async function handleCalculateRoute() {
    const start = getGridCell(startPosition);
    const goal = getGridCell(goalPosition);

    if (!start || !goal) {
      setRouteError(
        "Choose valid start and goal positions inside the terrain grid."
      );
      return;
    }

    if (start[0] === goal[0] && start[1] === goal[1]) {
      setRouteError(
        "Start and goal must be in different terrain-grid cells."
      );
      return;
    }

    setIsCalculatingRoute(true);
    setRouteError(null);
    setRouteGeoJSON(null);
    invalidateMissionEstimate();

    try {
      const result = await calculateRoute({
        start,
        goal,
        mode: routeMode,
      });

      setRouteGeoJSON(result);
    } catch (error) {
      setRouteError(
        getErrorMessage(error, "Unable to calculate the route.")
      );
    } finally {
      setIsCalculatingRoute(false);
    }
  }

  async function handleCalculateConsumables(payload) {
    if (!routeGeoJSON) {
      setMissionError(
        "Calculate a valid route before estimating mission consumables."
      );
      return;
    }

    const requestId = ++missionRequestId.current;

    setIsCalculatingMission(true);
    setMissionError(null);
    setConsumablesResult(null);

    try {
      const result = await estimateMissionConsumables(payload);

      if (requestId !== missionRequestId.current) {
        return;
      }

      setConsumablesResult(result);
    } catch (error) {
      if (requestId !== missionRequestId.current) {
        return;
      }

      setMissionError(
        getErrorMessage(
          error,
          "Unable to calculate mission consumables."
        )
      );
    } finally {
      if (requestId === missionRequestId.current) {
        setIsCalculatingMission(false);
      }
    }
  }

  return (
    <main className="mwi-app">
      <header className="mwi-app__header">
        <p className="mwi-app__eyebrow">
          MARSWALK INTELLIGENCE
        </p>
        <h1>Mars Mission Planner</h1>
        <p>
          Explore the Martian terrain, plan a route, and estimate
          mission duration and oxygen requirements.
        </p>
      </header>

      <HUD
        startPosition={startPosition}
        goalPosition={goalPosition}
        routeGeoJSON={routeGeoJSON}
        isCalculatingRoute={isCalculatingRoute}
        routeError={routeError}
        missionResult={consumablesResult}
        isCalculatingMission={isCalculatingMission}
        missionError={missionError}
      />

      <div className="mwi-app__workspace">
        <section
          className="mwi-app__map"
          aria-label="Interactive Mars terrain map"
        >
          <MarsMap
            startPosition={startPosition}
            goalPosition={goalPosition}
            onStartPositionChange={handleStartPositionChange}
            onGoalPositionChange={handleGoalPositionChange}
            routeGeoJSON={routeGeoJSON}
            markersDraggable={!isCalculatingRoute}
            showAOI
          />
        </section>

        <ControlPanel
          startPosition={startPosition}
          goalPosition={goalPosition}
          routeMode={routeMode}
          onRouteModeChange={handleRouteModeChange}
          onCalculateRoute={handleCalculateRoute}
          isCalculatingRoute={isCalculatingRoute}
          routeError={routeError}
          routeGeoJSON={routeGeoJSON}
          onCalculateConsumables={handleCalculateConsumables}
          consumablesResult={consumablesResult}
          isCalculatingMission={isCalculatingMission}
          missionError={missionError}
        />
      </div>
    </main>
  );
}
