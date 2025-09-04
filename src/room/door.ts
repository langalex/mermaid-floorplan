export function generateDoor(
  x: number,
  y: number,
  width: number,
  height: number,
  wallDirection?: string
): string {
  // Calculate center of the wall
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Determine door radius based on wall size (25% smaller)
  const radius = Math.min(width, height) * 9.6;

  // Determine door opening direction based on wall orientation
  let pathData = "";
  if (width > height) {
    // Horizontal wall
    if (wallDirection === "bottom") {
      // Bottom wall - door opens down
      const doorY = centerY + radius;
      pathData = `M ${centerX} ${centerY} L ${centerX} ${doorY} A ${radius} ${radius} 0 0 0 ${
        centerX + radius
      } ${centerY}`;
    } else {
      // Top wall - door opens up
      const doorY = centerY - radius;
      pathData = `M ${centerX} ${centerY} L ${centerX} ${doorY} A ${radius} ${radius} 0 0 1 ${
        centerX + radius
      } ${centerY}`;
    }
  } else {
    // Vertical wall
    if (wallDirection === "right") {
      // Right wall - door opens right
      const doorX = centerX + radius;
      const doorY = centerY - radius;
      pathData = `M ${centerX} ${centerY} L ${doorX} ${centerY} A ${radius} ${radius} 0 0 0 ${centerX} ${doorY}`;
    } else {
      // Left wall - door opens left
      const doorX = centerX - radius;
      const doorY = centerY - radius;
      pathData = `M ${centerX} ${centerY} L ${doorX} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX} ${doorY}`;
    }
  }

  // Draw only the door
  const door = `<path d="${pathData}" fill="white" stroke="black" stroke-width="0.05" data-type="door" data-direction="${wallDirection}" />`;

  return door;
}
