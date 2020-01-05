function main() {

    // Instantiate world
    let world = new ManyTiles("ManyTiles Example");

    // Create and show one room
    let room = world.newRoom();
    room.set({
        "name": "Example Room",
        "size": {'r': 5, 'c': 5}
    });

    // Create Agent
    let agent = room.newObject();
    agent.set({
        "name": "Agent",
        "isAgent": true,
        "icon": "fas fa-hiking",
        "type": "custom_class_agent",
        "position": {'r': 0, 'c': 0}
    });

    // Create coin object
    let obj = room.newObject();
    obj.set({
        "name": "coin",
        "isWall": false,
        "event": object => {
            world.text(object, "Coin collected!");
            room.removeObject(object);
        },
        "icon": "far fa-circle",
        "type": "custom_class_coin",
        "position": {'r': 4, 'c': 4}
    });

    // Create three walls
    let walls = [[2, 2], [1, 2], [2, 1]];
    for (let loc of walls) {
        let _obj = room.newObject();
        _obj.set({
            "name": "wall",
            "isWall": true,
            "event": object => {
                console.log("This text prints to the console when the player walks into a wall");
            },
            "icon": "fas fa-square-full",
            "type": "custom_class_wall",
            "position": {'r': loc[0], 'c': loc[1]}
        });
    }

    // Type level events
    world.events.set("custom_class_coin", object => console.log("type level event for coins. Object:", object._name));

    world.events.set("custom_class_wall", object => console.log("type level event for walls. Object:", object._name));

    // Show room
    world.showRoom(room);

    // Show text
    world.text(agent, "This example text is displayed when the project is loaded to orient the player. Press the 'enter' key to advance the text until the player is movable movable with the arrow keys. The 'source' of text dialogue is highlighted in orange.");
}
window.onload = main;
