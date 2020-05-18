export class Move extends Object { }

export class RelativeMove extends Move {
    /**
     *
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x, y) {
        super();
        this._x = x;
        this._y = y;
    }

    get x() { return this._x; }
    get y() { return this._y; }
}

export class AbsoluteMove extends Move {
    /**
     *
     * @param {Number} x
     * @param {Number} y
     */
    constructor(x, y) {
        super();
        this._x = x;
        this._y = y;
    }

    get x() { return this._x; }
    get y() { return this._y; }
}
