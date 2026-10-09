
import {
  MarsCRS,
  TILE_SIZE,
  MAX_ZOOM,
} from "./marsCRS.js";

/**
 * MarsWalk Intelligence map configuration.
 *
 * Reuses the existing Mars CRS and raster settings.
 * The tile URL points to the backend's documented tile endpoint.
 *
 * This module does not create a map, transform coordinates,
 * fetch data, or render React components.
 */
export const MARS_MAP_CONFIG = Object.freeze({
  crs: MarsCRS,
  tileSize: TILE_SIZE,
  maxZoom: MAX_ZOOM,
  tileUrl: "/tiles/ctx/{z}/{x}/{y}.png",
});
