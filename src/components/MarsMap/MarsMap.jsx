
import { useMemo } from "react";
import L from "leaflet";
import {
  GeoJSON,
  MapContainer,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { MARS_MAP_CONFIG } from "../../utils/mapConfig.js";
import { pixelToMars } from "../../utils/coordinates.js";
import {
  TILE_MATRIX_WIDTH,
  TILE_MATRIX_HEIGHT,
} from "../../utils/marsCRS.js";

/**
 * MarsWalk Intelligence map component.
 *
 * Coordinate conventions:
 * - Mars map coordinates: projected (x, y), in metres.
 * - Leaflet LatLng representation: lat = Mars y, lng = Mars x.
 * - Raster tiles: standard XYZ tile addressing.
 *
 * routeGeoJSON is optional. When supplied, its coordinates must be
 * projected Mars coordinates returned by the backend, not geographic
 * longitude/latitude in degrees.
 *
 * Set VITE_BACKEND_URL when the frontend and backend are served from
 * different origins and no development proxy is configured.
 */
export default function MarsMap({
  routeGeoJSON = null,
  tileUrl,
  initialZoom = 2,
  className,
  style,
}) {
  const resolvedTileUrl = useMemo(() => {
    if (tileUrl) {
      return tileUrl;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

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

        {routeGeoJSON && (
          <GeoJSON
            key={JSON.stringify(routeGeoJSON)}
            data={routeGeoJSON}
            style={() => ({
              color: "#ff6b35",
              weight: 4,
              opacity: 0.9,
            })}
          />
        )}
      </MapContainer>
    </div>
  );
}
