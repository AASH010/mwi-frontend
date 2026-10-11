
import { useState } from "react";

import NavigationPanel from "../Navigation/NavigationPanel.jsx";
import MissionDashboard from "../Mission/MissionDashboard.jsx";

/**
 * MarsWalk Intelligence control panel.
 *
 * Both panels remain mounted while switching tabs, preserving
 * their local React state. Application state and API requests
 * remain owned by App. MarsMap stays outside this component.
 */
export default function ControlPanel({
  startPosition = null,
  goalPosition = null,
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
  const [activeTab, setActiveTab] = useState("navigation");

  return (
    <aside
      className={`control-panel ${className}`.trim()}
      aria-label="Mission controls"
    >
      <div
        className="control-panel__tabs"
        role="tablist"
        aria-label="Mission sections"
      >
        <button
          id="control-tab-navigation"
          type="button"
          role="tab"
          aria-selected={activeTab === "navigation"}
          aria-controls="control-panel-navigation"
          tabIndex={activeTab === "navigation" ? 0 : -1}
          className={`control-panel__tab ${
            activeTab === "navigation" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("navigation")}
        >
          Navigation
        </button>

        <button
          id="control-tab-mission"
          type="button"
          role="tab"
          aria-selected={activeTab === "mission"}
          aria-controls="control-panel-mission"
          tabIndex={activeTab === "mission" ? 0 : -1}
          className={`control-panel__tab ${
            activeTab === "mission" ? "is-active" : ""
          }`}
          onClick={() => setActiveTab("mission")}
        >
          Mission
        </button>
      </div>

      <div
        id="control-panel-navigation"
        className="control-panel__content"
        role="tabpanel"
        aria-labelledby="control-tab-navigation"
        hidden={activeTab !== "navigation"}
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
      </div>

      <div
        id="control-panel-mission"
        className="control-panel__content"
        role="tabpanel"
        aria-labelledby="control-tab-mission"
        hidden={activeTab !== "mission"}
      >
        <MissionDashboard
          routeGeoJSON={routeGeoJSON}
          onCalculateConsumables={onCalculateConsumables}
          consumablesResult={consumablesResult}
          isCalculating={isCalculatingMission}
          error={missionError}
        />
      </div>
    </aside>
  );
}
