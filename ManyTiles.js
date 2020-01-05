class TextController {
    constructor(world, element) {
        this._world = world;
        this._element = element;
        this._queue = [];
    }
    showNow(textObject) {
        // Immediatly show text
        this.stage(textObject);
        this.next();
    }
    stage(textObject) {
        // Push textObject to queue
        this._queue.push(textObject);
    }
    next() {
        if (this._queue.length == 0) {
            this._world._textInProgress = false;
            this._element.innerHTML = "";
            this._world._textbox.className = "textbox";
            this._world._removeHighlight();

        } else if (!this._world._textInProgress) {
            this._world._textInProgress = true;
            this._queue.reverse();
            this._next();
        } else {
            this._next();
        }
    }
    _next() {
        let textObj = this._queue[this._queue.length - 1];
        let text = textObj.next();
        if (text != false) {
            this._element.innerHTML = text;
            if (textObj.check()) {
                this._world._textbox.className = "textbox enter";
                this._world._highlightCell(textObj._source);
            } else {
                this._world._textbox.className = "textbox last";
                this._world._highlightCell(textObj._source);
            }
        } else {
            this._queue.pop();
            this.next();
        }
    }
}
class TextObject {
    constructor(cell, text) {
        // Track the text source
        this._source = cell;

        // Text is the dialogue
        this._text = this._chunk(text);

        // Current index
        this._index = 0;
    }
    _chunk(text, size) {
        // Return array of text segments
        if (size == undefined) size = 115;
        let count = 0;
        let segments = [];
        let segment = [];
        let words = text.split(" ")
        let index = 0;
        while (index < words.length) {
            let word = words[index];
            let lookahead = count + word.length + 1; // +1 for space
            if (lookahead >= size) {
                segments.push(segment.join(" "));
                count = 0;
                segment = [];
            } else {
                segment.push(word);
                count += word.length + 1;
                index += 1;
            }
        }
        // Push final segment
        if (segment.length > 0) {
            segments.push(segment.join(" "));
        }
        return segments;
    }
    next() {
        // Returns more text or false if none
        if (this._index < this._text.length) {
            let nx = this._index;
            this._index += 1;
            return this._text[nx];
        } else {
            return false;
        }
    }
    check() {
        return this._index < this._text.length;
    }
}
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
    removeObject(object) {
        delete this._objects[object._uid];
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

        // Grid
        this._grid = [];

        // Global EventListeners
        window.addEventListener("click", e => {
            console.log("click event");
        });

        window.addEventListener("keydown", e => {

            if (e.key == "Enter") {
                this._textController.next();
                return;
            }

            let moveKeys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "w", "d", "s", "a"];

            // Key must be a move key
            if (moveKeys.indexOf(e.key) == -1) {
                return;
            }
            e.preventDefault();

            if (this._textInProgress) {
                return;
            }

            let move = {
                "ArrowUp": [-1, 0],
                "ArrowRight": [0, 1],
                "ArrowDown": [1, 0],
                "ArrowLeft": [0, -1],
                "w": [-1, 0],
                "d": [0, 1],
                "s": [1, 0],
                "a": [0, -1]
            };

            // Get current room
            let room = this._rooms[this._show];

            // List agents in current room
            let agents = Object.values(room._objects).filter(
                x => x._isAgent);

            // During a key event, we place all text in a
            // queue to ensure all renders happen first
            // then we show all text afterwards
            this._keyevent = true;

            // For each agent...
            for (let agent of agents) {

                // Offset
                let offset = move[e.key];

                // Predict next coordinate
                let nxCoord = {
                    'r': agent._position.r + offset[0],
                    'c': agent._position.c + offset[1]
                };

                // Ref to obj in next cell
                let obj = undefined;
                for (let key in room._objects) {
                    let _obj = room._objects[key];
                    if (_obj._position.r == nxCoord.r && _obj._position.c == nxCoord.c) {
                        obj = _obj;
                        break;
                    }
                }

                // Check bounds
                let br = (nxCoord.r >= 0) && (nxCoord.r < room._size.r);
                let bc = (nxCoord.c >= 0) && (nxCoord.c < room._size.c);
                let inBounds = br && bc;

                // Move agent if in bounds and obj is not a wall
                if ((inBounds && obj == undefined) || (inBounds && !obj._isWall)) {
                    agent._position = nxCoord;
                }

                // Call item event
                if (obj != undefined) {
                    obj._event(obj);
                }

                // Call type level event
                if (obj != undefined) {
                    let type = obj._type;
                    if (type in this.events._events) {
                        this.events._events[type](obj);
                    }
                }
            }
            this._keyevent = false;

            // Call render
            this._render();

            // Trigger text box render
            this._textController.next();
        });

        // Link to dom elements
        this._worldName = document.querySelector(".world-name");
        this._roomName = document.querySelector(".room-name");
        this._pageArea = document.querySelector(".page-area");
        this._gridContainer = this._createContainer("grid-container");
        this._pageArea.appendChild(this._gridContainer);

        // Text API
        this._textboxArea = this._createContainer("textbox-area");
        this._textboxContainer = this._createContainer("textbox-container");
        this._textbox = this._createContainer("textbox");
        this._pageArea.appendChild(this._textboxArea);
        this._textboxArea.appendChild(this._textboxContainer);
        this._textboxContainer.appendChild(this._textbox);
        this.text = this._text;
        this._keyevent = false; // If keyevent, push to text cache
        this._textInProgress = false;
        this._textController = new TextController(this, this._textbox);
    }
    _text(cell, text) {
        if (!this._keyevent) {
            this._textInProgress = true;
            this._textController.showNow(new TextObject(cell, text));

        } else {
            this._textController.stage(new TextObject(cell, text));
        }
    }
    _createContainer(className) {
        let div = document.createElement("div");
        div.className = className;
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
          this._gridContainer.removeChild(
              this._gridContainer.firstChild);
        }

        // Store list of grid cells
        this._grid = [];

        // Adjust grid container width
        this._gridContainer.style.width = (col * 50).toString() + "px";

        // Create grid
        for (let r=0; r < row; r++) {
            for (let c=0; c < col; c++) {
                let cell = this._createCell();
                this._grid.push(cell);
                this._gridContainer.appendChild(cell);
            }
        }

        // Two objects in one cell are not allowed
        let occupied = {};

        // Place objects
        for (let key in room._objects) {
            let obj = room._objects[key];
            let number = this._coordinateToNumber(room, obj._position);

            // Agents take priority, otherwise
            // cell must be empty
            if (obj._isAgent || !(number in occupied)) {
                occupied[number] = obj;
                let cell = this._grid[number];

                // Clear cell if agent should take over
                while (cell.firstChild) {
                  cell.removeChild(cell.firstChild);
                }

                cell.appendChild(this._createObject(cell, obj));
            }
        }
    }
    _highlightCell(obj) {
        // Get current room
        let room = this._rooms[this._show];
        let cell = this._grid[this._coordinateToNumber(room, obj._position)];
        cell.className = "cell highlight";
    }
    _removeHighlight() {
        let cells = document.querySelectorAll(".cell");
        for (let cell of cells) {
            cell.className = "cell";
        }
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
