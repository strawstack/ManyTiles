function main() {

    // Instantiate world
    let world = new ManyTiles();

    // Create and show one room
    let room = world.newRoom();
    room.set({
        "name": "Library",
        "size": {'r': 5, 'c': 5}
    });

    // Create Agent
    let agent = room.newObject();
    agent.set({"name": "Agent"});
    agent.set({"isAgent": true});
    agent.set({"position": {'r': 0, 'c': 0}});

    // Create coin object
    let obj = room.newObject();
    obj.set({"name": "coin"});
    obj.set({"isWall": false});
    obj.set({"event": () => console.log("coin collected!")});
    obj.set({"icon": "far fa-circle"});
    obj.set({"type": "custom_class_coin"});
    obj.set({"position": {'r': 4, 'c': 4}});

    // Create three walls
    let walls = [(2, 2), (1, 2), (2, 1)];
    for (let loc of walls) {
        let _obj = room.newObject();
        _obj.set({
            "name": "wall",
            "isWall": true,
            "event": () => console.log("wall event"),
            "icon": "fas fa-square-full",
            "type": "custom_class_wall",
            "position": {'r': loc[0], 'c': loc[1]}
        });
    }

    // Type level events
    world.events.set("custom_class_coin", object_id => console.log("type level behaviour for coins. Object:", object_id));

    world.events.set("custom_class_wall", object_id => console.log("type level behaviour for walls. Object:", object_id));

    // Show room
    world.showRoom(room);
}
window.onload = main;
