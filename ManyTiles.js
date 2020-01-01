class Object {
    constructor(room) {
        this._room = room;

        // Defaults
        this._name = "";
        this._isWall = false;
        this._isAgent = false;
        this._event = () => {};
        this._icon = "";
        this._type = "";
        this._position = undefined;
    }
    set(prop) {
        
    }
}

class Room {
    constructor(world, name) {
        this._world = world;

        // Map of objects: name -> properties object
        this._objects = {};

        // Defaults
        this._name = name;
        this._size = {'r': 5, 'c': 5};
    }
    set(prop) {
        if ("name" in prop) {
            // Remove old name
            delete this._world._rooms[this._name];
            // Get new name
            let new_name = prop["name"];
            // Point new name to this room
            this._world._rooms[new_name] = this;
            // Assign new name to this room
            this._name = new_name;
        }
        if ("size" in prop) {
            let size = prop["size"];
            this._size["r"] = size["r"];
            this._size["c"] = size["c"];
        }

        // Re-render room in case of changes
        this._world._render();
    }
}

class ManyTiles {
    constructor() {
        // Map of rooms: name -> properties object
        this._rooms = {};

        // Name of the room to show
        this._show = "";

        // Setup EventListeners
        // Keypress
        // Mouse click

    }
    newRoom() {
        let count = Object.keys(this._rooms).length.toString();
        let name = "Room_" + count;
        let room = new Room(this, name);
        this._rooms[name] = room;
        return room;
    }
    showRoom(name) {
        this._show = name;
        this._render();
    }
    _render() {
        // Render the current room and objects
    }
}
