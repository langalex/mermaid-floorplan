export function generateWindow(
  x: number,
  y: number,
  width: number,
  height: number,
  wallDirection?: string
): string {
  // Calculate center of the wall
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Determine window size based on wall orientation
  let windowWidth: number;
  let windowHeight: number;

  if (width > height) {
    // Horizontal wall - window is at least 20% smaller than wall width
    windowWidth = Math.min(width * 0.8, width - 0.2); // 80% of wall width or wall width minus padding
    windowHeight = 0.1; // Small height for horizontal walls
  } else {
    // Vertical wall - window is at least 20% smaller than wall height
    windowWidth = 0.1; // Small width for vertical walls
    windowHeight = Math.min(height * 0.8, height - 0.2); // 80% of wall height or wall height minus padding
  }

  // Calculate window position (centered on wall)
  const windowX = centerX - windowWidth / 2;
  const windowY = centerY - windowHeight / 2;

  // Create window frame (rectangle with thicker stroke)
  const windowFrame = `<rect x="${windowX}" y="${windowY}" width="${windowWidth}" height="${windowHeight}" 
    fill="white" stroke="black" stroke-width="0.01" data-type="window" data-direction="${wallDirection}" />`;

  return windowFrame;
}
