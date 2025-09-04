# Room Attributes Todo List

## Required Attributes

- [x] **name** (string) - The room identifier
- [ ] **type** ('room' | 'sub-room') - Room type classification
- [x] **position** (Coordinate) - Contains x and y coordinates
  - [x] x (number) - X coordinate
  - [x] y (number) - Y coordinate
- [x] **size** (Dimension) - Contains width and height
  - [x] width (number) - Room width
  - [x] height (number) - Room height
- [x] **walls** (WallSpec) - Array of wall specifications
  - [x] specifications (Array<WallSpecification>) - Each specification has:
    - [x] direction ('top' | 'right' | 'bottom' | 'left')
    - [x] type ('solid' | 'door' | 'window' | 'open')

## Optional Attributes

- [x] **label** (string) - Optional display label
- [ ] **subRooms** (Array<Room>) - Nested rooms for composition
