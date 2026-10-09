
import { useMemo } from "react";
import L from "leaflet";
import { Marker, Tooltip } from "react-leaflet";

/**
 * MarsWalk Intelligence — Start position marker.
 *
 * position uses Leaflet order: [Mars Y, Mars X].
 * Both values are projected Mars coordinates in metres,
 * not geographic latitude/longitude in degrees.
 *
 * onPositionChange receives the updated position as [Y, X].
 * Conversion to terrain-grid [row, col] belongs to the
 * navigation integration layer.
 */
export default function StartMarker({
  position = null,
  onPositionChange,
  draggable = true,
  label = "Start",
}) {
  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "mwi-start-marker",
        html: `
          <span style="
            display: block;
            width: 18px;
            height: 18px;
            border: 3px solid #ffffff;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.55);
          "></span>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        tooltipAnchor: [0, -12],
      }),
    []
  );

  const eventHandlers = useMemo(
    () => ({
      dragend(event) {
        const { lat, lng } = event.target.getLatLng();
        onPositionChange?.([lat, lng]);
      },
    }),
    [onPositionChange]
  );

  if (
    !Array.isArray(position) ||
    position.length !== 2 ||
    !position.every(Number.isFinite)
  ) {
    return null;
  }

  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable={draggable}
      eventHandlers={eventHandlers}
      keyboard
      title={label}
      alt={label}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        {label}
      </Tooltip>
    </Marker>
  );
}
