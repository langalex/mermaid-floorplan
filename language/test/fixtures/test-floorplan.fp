floorplan
    floor 1 {
        room MasterBathroom at (0,0) size (15x8) walls [top: solid, right: solid, bottom: door, left: solid] label "Master Bathroom" composed of [
            sub-room Toilet1 at (10,0) size (5x3) walls [top: solid, right: door, bottom: solid, left: solid] label "Toilet"
        ]

        room MasterBedroom at (0,8) size (15x11) walls [top: door, right: solid, bottom: door, left: door] label "Master Bedroom"
        
        room WalkInCloset at (15,0) size (7x8) walls [top: door, right: solid, bottom: solid, left: solid] label "Walk-In Closet"
    }

    # Doors and connections
    connect MasterBathroom.right to MasterBedroom.left door at 0% opens into MasterBathroom
    connect MasterBathroom.bottom to WalkInCloset.top door opens into WalkInCloset
    connect MasterBedroom.top to outside double-door at 100%
