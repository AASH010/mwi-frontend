
/**
 * Coordinate utilities for MarsWalk Intelligence.
 *
 * CTX map pixels and terrain grid cells are different coordinate spaces.
 *
 * Mars projected coordinates: (x, y), in metres.
 * Leaflet coordinates: [lat, lng] = [y, x].
 * Terrain grid coordinates: [row, col].
 *
 * Terrain grid metadata verified from the processed GeoTIFF:
 * - 500 rows x 500 columns
 * - 20 metres per cell
 * - left: 4,350,000 metres
 * - top: 1,100,000 metres
 */

// Preserve the existing CTX pixel conversion API.
export {
  marsToPixel,
  pixelToMars,
} from "./marsCRS.js";

export const TERRAIN_GRID = Object.freeze({
  rows: 500,
  cols: 500,
  resolution: 20,
  left: 4_350_000,
  top: 1_100_000,
});

/**
 * Convert projected Mars coordinates to terrain grid indices.
 *
 * @param {{x: number, y: number}} point
 * @returns {[number, number] | null} [row, col], or null if invalid
 */
export function marsToGrid(point) {
  if (
    !point ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y)
  ) {
    return null;
  }

  const { rows, cols, resolution, left, top } = TERRAIN_GRID;

  const col = Math.floor((point.x - left) / resolution);
  const row = Math.floor((top - point.y) / resolution);

  if (
    row < 0 ||
    row >= rows ||
    col < 0 ||
    col >= cols
  ) {
    return null;
  }

  return [row, col];
}

/**
 * Convert terrain grid indices to the projected coordinates
 * of the cell centre.
 *
 * @param {number} row
 * @param {number} col
 * @returns {{x: number, y: number} | null}
 */
export function gridToMars(row, col) {
  const { rows, cols, resolution, left, top } = TERRAIN_GRID;

  if (
    !Number.isInteger(row) ||
    !Number.isInteger(col) ||
    row < 0 ||
    row >= rows ||
    col < 0 ||
    col >= cols
  ) {
    return null;
  }

  return {
    x: left + (col + 0.5) * resolution,
    y: top - (row + 0.5) * resolution,
  };
}
