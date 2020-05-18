import { Piece } from "./piece";

export class Square extends Object {
    /**
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x, y) {
        super();
        this._x = x;
        this._y = y;

        /** @type {Piece} */
        this._resident = null;

        this.status = "";
    }

    get x() { return this._x; };
    get y() { return this._y; };
    get resident() { return this._resident; }
    get occupied() { return (this.resident) ? true : false; }

    set resident(resident) {
        if (resident) {
            if (resident.square) {
                // Remove new resident from previous square
                resident.square.resident = null;
            }

            // Set reference to this square in new resident
            resident.square = this;
        }

        if (this._resident) {
            // Remove reference to this square from old resident
            this._resident.square = null;
        }

        // Take ownership of new resident
        this._resident = resident;
    }
}
