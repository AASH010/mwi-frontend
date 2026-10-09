
import { useMemo } from "react";
import L from "leaflet";
import { Marker, Tooltip } from "react-leaflet";

/**
 * MarsWalk Intelligence — Goal position marker.
 *
 * Position format: [Mars Y, Mars X], in projected metres.
 * This follows Leaflet's [lat, lng] ordering adapted for Mars.
 *
 * onPositionChange receives [Mars Y, Mars X].
 * Conversion to navigation-grid [row, col] must happen
 * in the navigation integration layer.
 */
export default function GoalMarker({
  position = null,
  onPositionChange,
  draggable = true,
  label = "Goal",
}) {
  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "mwi-goal-marker",
        html: `
          <span style="
            display: block;
            width: 18px;
            height: 18px;
            border: 3px solid #ffffff;
            border-radius: 50%;
            background: #ef4444;
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
