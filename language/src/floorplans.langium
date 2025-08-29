grammar Floorplans

// Entry rule
entry Floorplan:
    'floorplan' floors+=Floor* connections+=Connection*;

// Floor definition
Floor:
    'floor' id=ID '{' 
        rooms+=Room*
    '}';

// Room definition
Room:
    type=('room' | 'sub-room') name=ID 
    'at' position=Coordinate 
    'size' size=Dimension 
    'walls' walls=WallSpec
    ('label' label=STRING)?
    ('composed' 'of' '[' subRooms+=Room* ']')?;

// Wall specification
WallSpec:
    '[' specifications+=WallSpecification (',' specifications+=WallSpecification)* ']';

WallSpecification:
    direction=WallDirection ':' type=WallType;

// Connection statements  
Connection:
    'connect' from=WallReference 'to' to=WallReference 
    doorType=DoorType
    ('at' position=NUMBER '%')?
    ('door' 'opens' 'into' opensInto=RoomReference | 'opens' 'into' opensInto=RoomReference)?
    ('swing' ':' swing=SwingDirection)?;

// Wall reference (room.wall or just room)
WallReference:
    room=RoomReference ('.' wall=WallDirection)?;

// Room reference (can be room name or 'outside')
RoomReference:
    name=ID | 'outside';

// Coordinate (x,y)
Coordinate:
    '(' x=NUMBER ',' y=NUMBER ')';

// Dimension (width x height)  
Dimension:
    '(' width=NUMBER 'x' height=NUMBER ')';

// Wall directions
WallDirection returns string:
    'top' | 'right' | 'bottom' | 'left';

// Wall types
WallType returns string:
    'solid' | 'door' | 'window' | 'open';

// Door types
DoorType returns string:
    'door' | 'double-door';

// Swing directions
SwingDirection returns string:
    'left' | 'right';

// Terminal rules
terminal ID: /[_a-zA-Z][\w]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9]+)?/;
terminal STRING: /"[^"]*"|'[^']*'/;

// Comments
hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /#[^\r\n]*/;
