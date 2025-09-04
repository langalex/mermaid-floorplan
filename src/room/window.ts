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
    // Horizontal wall
    windowWidth = Math.min(width, height) * 20;
    windowHeight = Math.min(width, height); // Proportional height
  } else {
    // Vertical wall
    windowWidth = Math.min(width, height); // Proportional width
    windowHeight = Math.min(width, height) * 20;
  }

  // Calculate window position (centered on wall)
  const windowX = centerX - windowWidth / 2;
  const windowY = centerY - windowHeight / 2;

  // Create window frame (rectangle with thicker stroke)
  const windowFrame = `<rect x="${windowX}" y="${windowY}" width="${windowWidth}" height="${windowHeight}" 
    fill="white" stroke="black" stroke-width="0.01" data-type="window" data-direction="${wallDirection}" />`;

  return windowFrame;
}
