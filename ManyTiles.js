class Events {
    constructor() {
        this._events = {};
    }
    set(type, callback) {
        this._events[type] = callback;
    }
}

class CObject {
    constructor(room, name, uid) {
        this._room = room;

        // Defaults
        this._name = name;
        this._uid = uid;
        this._isWall = false;
        this._isAgent = false;
        this._event = () => {};
        this._icon = "";
        this._type = "";
        this._position = undefined;
    }
    set(prop) {
        if ("name" in prop) {
            // Assign new name to this object
            this._name = prop["name"];
        }
        if ("isAgent" in prop) {
            this._isAgent = prop["isAgent"];
        }
        if ("position" in prop) {
            let pos = prop["position"];
            this._position = {'r': pos['r'], 'c': pos['c']};
        }
        if ("isWall" in prop) {
            this._isWall = prop["isWall"];
        }
        if ("event" in prop) {
            this._event = prop["event"];
        }
        if ("icon" in prop) {
            this._icon = prop["icon"];
        }
        if ("type" in prop) {
            this._type = prop["type"];
        }
    }
}

class Room {
    constructor(world, name) {
        this._world = world;

        // Map of objects: name -> properties object
        this._objects = {};

        this._uid = 0;

        // Defaults
        this._name = name;
        this._size = {'r': 5, 'c': 5};
    }
    newObject() {
        let name = "Object_" + this._uid;
        let obj = new CObject(this, name, this._uid);
        this._objects[this._uid] = obj;
        this._uid += 1;
        return obj;
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
    constructor(name) {
        // Set world name
        if (name == undefined) name = "Project Title";
        this._name = name;

        // Map of rooms: name -> properties object
        this._rooms = {};

        // Name of the room to show
        this._show = "";

        // Type level events
        this.events = new Events();

        // Global EventListeners
        window.addEventListener("click", e => {
            console.log("click event");
        });

        window.addEventListener("keydown", e => {
            console.log("keydown event");

            // For each agent

                // Predict next coordinate

                // Check bounds

                // Check walkable

                // Optionally move agent

                // Call item event

                // Call type level events

            // Call render

            // Trigger text box queue
            // NOTE - all state updates occur first
            // render occurs
            // text is shown to the user
            // The user must click through text boxes
            // before game becomes interactable again
        });

        // Link to dom elements
        this._worldName = document.querySelector(".world-name");
        this._roomName = document.querySelector(".room-name");
        this._pageArea = document.querySelector(".page-area");
        this._gridContainer = this._createContainer();
        this._pageArea.appendChild(this._gridContainer);
    }
    _createContainer() {
        let div = document.createElement("div");
        div.className = "grid-container";
        return div;
    }
    newRoom() {
        let count = Object.keys(this._rooms).length.toString();
        let name = "Room_" + count;
        let room = new Room(this, name);
        this._rooms[name] = room;
        return room;
    }
    showRoom(room) {
        this._show = room._name;
        this._render();
    }
    _render() {
        // Render the current room and objects
        let room = this._rooms[this._show];

        // Room not ready
        if (room == undefined) return;

        // Properties of room
        let name = room._name;
        let row = room._size.r;
        let col = room._size.c;

        // Set world name and room name
        this._worldName.innerHTML = this._name;
        this._roomName.innerHTML  = name;

        // Clear existing world
        while (this._gridContainer.firstChild) {
          this._gridContainer.firstChild.removeChild(
              this._gridContainer.firstChild);
        }

        // Store list of grid cells
        let grid = [];

        // Adjust grid container width
        this._gridContainer.style.width = (col * 50).toString() + "px";

        // Create grid
        for (let r=0; r < row; r++) {
            for (let c=0; c < col; c++) {
                let cell = this._createCell();
                grid.push(cell);
                this._gridContainer.appendChild(cell);
            }
        }

        // Place objects
        for (let key in room._objects) {
            let obj = room._objects[key];
            let cell = grid[
                this._coordinateToNumber(room, obj._position)];
            cell.appendChild(this._createObject(cell, obj));
        }

        // Place player
    }
    _createCell() {
        let div = document.createElement("div");
        div.className = "cell";
        return div;
    }
    _numberToCoordinate(room, number) {
        let c = number % room._size.c;
        if (c < 0) {
            c += room._size.c;
        }
        return [
            Math.floor(number/room._size.c), c
        ];
    }
    _coordinateToNumber(room, coordinate) {
        return (coordinate.r * room._size.c) + coordinate.c;
    }
    _createObject(cell, obj) {
        let _obj = document.createElement("i");
        _obj.className = "object " + obj._icon + " " + obj._type;
        return _obj;
    }
}
