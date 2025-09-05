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
      const startX = centerX - radius / 2;
      const endX = centerX + radius / 2;
      pathData = `M ${startX} ${centerY} L ${startX} ${doorY} A ${radius} ${radius} 0 0 0 ${endX} ${centerY}`;
    } else {
      // Top wall - door opens up
      const doorY = centerY - radius;
      const startX = centerX - radius / 2;
      const endX = centerX + radius / 2;
      pathData = `M ${startX} ${centerY} L ${startX} ${doorY} A ${radius} ${radius} 0 0 1 ${endX} ${centerY}`;
    }
  } else {
    // Vertical wall
    if (wallDirection === "right") {
      // Right wall - door opens right
      const doorX = centerX + radius;
      const startY = centerY - radius / 2;
      const endY = centerY + radius / 2;
      pathData = `M ${centerX} ${startY} L ${doorX} ${startY} A ${radius} ${radius} 0 0 1 ${centerX} ${endY}`;
    } else {
      // Left wall - door opens left
      const doorX = centerX - radius;
      const startY = centerY - radius / 2;
      const endY = centerY + radius / 2;
      pathData = `M ${centerX} ${startY} L ${doorX} ${startY} A ${radius} ${radius} 0 0 0 ${centerX} ${endY}`;
    }
  }

  // Draw only the door
  const door = `<path d="${pathData}" fill="white" stroke="black" stroke-width="0.05" data-type="door" data-direction="${wallDirection}" />`;

  return door;
}
