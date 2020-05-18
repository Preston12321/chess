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

        this._active = false;
        this._takeable = false;
        this._open = false;
        this._recent = false;

        this.status = "";
    }

    get x() { return this._x; }
    get y() { return this._y; }

    get active() { return this._active; }
    get takeable() { return this._takeable; }
    get open() { return this._open; }
    get recent() { return this._recent; }
    get clear() { return !(this.active || this.takeable || this.open || this.recent); }

    get resident() { return this._resident; }
    get occupied() { return (this.resident) ? true : false; }

    set active(val) {
        if (!val) {
            // If this square is currently active, then clear all statuses
            // No more than one should be set anyways
            if (this.active) {
                this.clear = true;
            }

            // Otherwise, don't mess with anything
            return;
        }

        // Make sure no other statuses are set, then set square to active
        this.clear = true;
        this._active = true;
    }

    set takeable(val) {
        if (!val) {
            // If this square is currently takeable, then clear all statuses
            // No more than one should be set anyways
            if (this.takeable) {
                this.clear = true;
            }

            // Otherwise, don't mess with anything
            return;
        }

        // Make sure no other statuses are set, then set square to takeable
        this.clear = true;
        this._takeable = true;
    }

    set open(val) {
        if (!val) {
            // If this square is currently open, then clear all statuses
            // No more than one should be set anyways
            if (this.open) {
                this.clear = true;
            }

            // Otherwise, don't mess with anything
            return;
        }

        // Make sure no other statuses are set, then set square to open
        this.clear = true;
        this._open = true;
    }

    set recent(val) {
        if (!val) {
            // If this square is currently recent, then clear all statuses
            // No more than one should be set anyways
            if (this.recent) {
                this.clear = true;
            }

            // Otherwise, don't mess with anything
            return;
        }

        // Make sure no other statuses are set, then set square to recent
        this.clear = true;
        this._recent = true;
    }

    set clear(val) {
        // Only do anything if we actually want to clear the status
        if (!val) return;

        // Bypass setters to ensure no weird call loops
        this._active = false;
        this._takeable = false;
        this._open = false;
        this._recent = false;
    }

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
