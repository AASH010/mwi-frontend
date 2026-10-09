import NavigationPanel from "./Navigation/NavigationPanel.jsx";
import MissionDashboard from "./Mission/MissionDashboard.jsx";

/**
 * MarsWalk Intelligence control panel.
 *
 * Composes navigation controls and mission planning controls.
 * API requests and application state remain owned by the parent.
 */
export default function ControlPanel({
  startPosition = null,
  goalPosition = null,
  onStartPositionChange,
  onGoalPositionChange,
  routeMode = "balanced",
  onRouteModeChange,
  onCalculateRoute,
  isCalculatingRoute = false,
  routeError = null,
  routeGeoJSON = null,
  onCalculateConsumables,
  consumablesResult = null,
  isCalculatingMission = false,
  missionError = null,
  className = "",
}) {
  return (
    <aside
      className={`control-panel ${className}`.trim()}
      aria-label="Mission controls"
    >
      <NavigationPanel
        startPosition={startPosition}
        goalPosition={goalPosition}
        routeMode={routeMode}
        onRouteModeChange={onRouteModeChange}
        onCalculateRoute={onCalculateRoute}
        isCalculating={isCalculatingRoute}
        error={routeError}
        routeGeoJSON={routeGeoJSON}
      />

      <MissionDashboard
        routeGeoJSON={routeGeoJSON}
        onCalculateConsumables={onCalculateConsumables}
        consumablesResult={consumablesResult}
        isCalculating={isCalculatingMission}
        error={missionError}
      />
    </aside>
  );
}
