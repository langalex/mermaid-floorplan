# Mermaid Floorplan Grammar

A Langium grammar for describing architectural floor plans, designed to support the proposed floorplan syntax for Mermaid.js ([GitHub Issue #6134](https://github.com/mermaid-js/mermaid/issues/6134)).

## Overview

This grammar enables declarative definition of room layouts, including:

- **Room Placement**: Define rooms with dimensions, coordinates, and wall specifications
- **Sub-Rooms**: Nested rooms within parent rooms (closets, bathrooms, etc.)
- **Connections**: Doors and windows with precise placement and behavior
- **Multi-Level Support**: Floor hierarchies with complex layouts

## Grammar Features

### Core Elements

- **Floorplan**: Root container for all floor definitions
- **Floors**: Named floor levels containing rooms
- **Rooms**: Primary spaces with coordinates, dimensions, and wall specifications
- **Sub-rooms**: Nested spaces within parent rooms
- **Connections**: Door/window connections between spaces

### Wall Types

- `solid`: Standard wall
- `door`: Wall with door opening
- `window`: Wall with window opening
- `open`: Open wall (no barrier)

### Connection Types

- `door`: Standard door
- `double-door`: Double door opening

## Example

```floorplan
floorplan
    floor 1 {
        room MasterBathroom at (0,0) size (15x8) walls [top: solid, right: solid, bottom: door, left: solid] label "Master Bathroom" composed of [
            sub-room Toilet1 at (10,0) size (5x3) walls [top: solid, right: door, bottom: solid, left: solid] label "Toilet"
        ]

        room MasterBedroom at (0,8) size (15x11) walls [top: door, right: solid, bottom: door, left: door] label "Master Bedroom"

        room WalkInCloset at (15,0) size (7x8) walls [top: door, right: solid, bottom: solid, left: solid] label "Walk-In Closet"
    }

    # Connections between rooms
    connect MasterBathroom.right to MasterBedroom.left door at 0% opens into MasterBathroom
    connect MasterBathroom.bottom to WalkInCloset.top door opens into WalkInCloset
    connect MasterBedroom.top to outside double-door at 100%
```

## Installation & Usage

To install dependencies:

```bash
npm install
```

To test the grammar:

```bash
npm run test-grammar.ts
```

## Grammar Structure

The grammar defines:

- **Terminal Rules**: Basic tokens (ID, NUMBER, STRING)
- **Parser Rules**: Structural elements (Floorplan, Floor, Room, Connection)
- **Support for**: Comments, wall specifications, coordinate systems, nested rooms

## Files

- `floorplan.langium`: Main grammar definition
- `test-floorplan.fp`: Example floorplan file
- `test-grammar.ts`: Grammar validation script

This project was created using [Langium](https://langium.org).
