
import { Rectangle, Tooltip } from "react-leaflet";

/**
 * MarsWalk Intelligence — Area of Interest layer.
 *
 * AOI bounds use projected Mars coordinates in metres.
 * Leaflet expects [lat, lng], represented here as [Mars Y, Mars X].
 *
 * This component renders the operational Jezero sector boundary.
 * It does not create a map or perform coordinate transformations.
 */

const AOI_BOUNDS = [
  [1_090_000, 4_350_000], // South-West: [minY, minX]
  [1_100_000, 4_360_000], // North-East: [maxY, maxX]
];

const AOI_STYLE = {
  color: "#4fc3f7",
  weight: 2,
  dashArray: "6 6",
  fillOpacity: 0.03,
};

export default function AOILayer() {
  return (
    <Rectangle
      bounds={AOI_BOUNDS}
      pathOptions={AOI_STYLE}
    >
      <Tooltip sticky>
        Jezero Operational Sector — 10 × 10 km AOI
      </Tooltip>
    </Rectangle>
  );
}
