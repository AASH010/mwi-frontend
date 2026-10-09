/**
 * Coordinate utilities for MarsWalk Intelligence.
 *
 * The Mars CRS implementation remains the source of truth for
 * conversion between projected Mars coordinates and CTX raster pixels.
 *
 * Mars projected coordinates use (x, y) in metres.
 * CTX pixel coordinates are a separate coordinate space.
 *
 * This module re-exports the existing conversion functions rather
 * than duplicating their projection mathematics.
 */

export {
  marsToPixel,
  pixelToMars,
} from "./marsCRS.js";
