
import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";

/**
 * MarsWalk Intelligence — Route rendering layer.
 *
 * Accepts the GeoJSON FeatureCollection returned by the
 * navigation backend.
 *
 * Backend route coordinates are projected Mars coordinates
 * in metres, ordered as [x, y].
 *
 * Leaflet's GeoJSON layer maps [x, y] to [lng, lat],
 * which matches the Mars CRS convention used by MarsMap.
 *
 * This component only renders routes. It does not request
 * navigation or convert coordinates to grid indices.
 */
export default function RouteLayer({
  routeGeoJSON = null,
  color = "#ff6b35",
  weight = 4,
  opacity = 0.9,
}) {
  const routeKey = useMemo(
    () => (routeGeoJSON ? JSON.stringify(routeGeoJSON) : ""),
    [routeGeoJSON]
  );

  const isValidRoute = useMemo(() => {
    if (!routeGeoJSON || typeof routeGeoJSON !== "object") {
      return false;
    }

    if (routeGeoJSON.type !== "FeatureCollection") {
      return false;
    }

    if (!Array.isArray(routeGeoJSON.features)) {
      return false;
    }

    return routeGeoJSON.features.some((feature) => {
      const geometry = feature?.geometry;

      if (!geometry) {
        return false;
      }

      if (
        geometry.type !== "LineString" &&
        geometry.type !== "MultiLineString"
      ) {
        return false;
      }

      return Array.isArray(geometry.coordinates);
    });
  }, [routeGeoJSON]);

  const pathOptions = useMemo(
    () => ({
      color,
      weight,
      opacity,
      lineCap: "round",
      lineJoin: "round",
    }),
    [color, weight, opacity]
  );

  if (!isValidRoute) {
    return null;
  }

  return (
    <GeoJSON
      key={routeKey}
      data={routeGeoJSON}
      style={() => pathOptions}
    />
  );
}
