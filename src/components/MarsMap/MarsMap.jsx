jsx
import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { MARS_MAP_CONFIG } from "../../utils/mapConfig.js";
import { pixelToMars } from "../../utils/coordinates.js";
import {
  TILE_MATRIX_WIDTH,
  TILE_MATRIX_HEIGHT,
} from "../../utils/marsCRS.js";

import AOILayer from "./AOILayer.jsx";
import StartMarker from "./StartMarker.jsx";
import GoalMarker from "./GoalMarker.jsx";
import RouteLayer from "./RouteLayer.jsx";

/**
 * MarsWalk Intelligence map component.
 *
 * Coordinate conventions:
 * - Projected Mars coordinates: (x, y), in metres.
 * - Leaflet positions: [y, x].
 * - Backend GeoJSON coordinates: [x, y].
 * - Terrain grid coordinates: [row, col], handled by navigation logic.
 *
 * This component composes the map layers. It does not request routes
 * or convert marker positions to terrain-grid indices.
 */
export default function MarsMap({
  routeGeoJSON = null,
  startPosition = null,
  goalPosition = null,
  onStartPositionChange,
  onGoalPositionChange,
  markersDraggable = true,
  showAOI = true,
  tileUrl,
  initialZoom = 2,
  className,
  style,
}) {
  const resolvedTileUrl = useMemo(() => {
    if (tileUrl) {
      return tileUrl;
    }

    const backendUrl =
      import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

    return backendUrl
      ? `${backendUrl}${MARS_MAP_CONFIG.tileUrl}`
      : MARS_MAP_CONFIG.tileUrl;
  }, [tileUrl]);

  const { center, maxBounds } = useMemo(() => {
    const topLeft = pixelToMars(L.point(0, 0));

    const bottomRight = pixelToMars(
      L.point(TILE_MATRIX_WIDTH, TILE_MATRIX_HEIGHT)
    );

    const midpoint = pixelToMars(
      L.point(
        TILE_MATRIX_WIDTH / 2,
        TILE_MATRIX_HEIGHT / 2
      )
    );

    return {
      center: [midpoint.y, midpoint.x],
      maxBounds: L.latLngBounds(
        [bottomRight.y, topLeft.x],
        [topLeft.y, bottomRight.x]
      ),
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 420,
        ...style,
      }}
    >
      <MapContainer
        crs={MARS_MAP_CONFIG.crs}
        center={center}
        zoom={initialZoom}
        minZoom={0}
        maxZoom={MARS_MAP_CONFIG.maxZoom}
        maxBounds={maxBounds}
        maxBoundsViscosity={1}
        style={{
          width: "100%",
          height: "100%",
          minHeight: 420,
        }}
      >
        <TileLayer
          url={resolvedTileUrl}
          tileSize={MARS_MAP_CONFIG.tileSize}
          minZoom={0}
          maxZoom={MARS_MAP_CONFIG.maxZoom}
          noWrap
        />

        {showAOI && <AOILayer />}

        <StartMarker
          position={startPosition}
          onPositionChange={onStartPositionChange}
          draggable={markersDraggable}
        />

        <GoalMarker
          position={goalPosition}
          onPositionChange={onGoalPositionChange}
          draggable={markersDraggable}
        />

        <RouteLayer routeGeoJSON={routeGeoJSON} />
      </MapContainer>
    </div>
  );
}

