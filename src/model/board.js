import { Square } from "./square";

export class Board extends Object {
    constructor() {
        super();

        /** @type {Array<Array<Square>>} */
        this.squares = [];

        for (let y = 0; y < 8; y++) {
            let row = [];
            for (let x = 0; x < 8; x++) {
                row.push(new Square(this, x, y));
            }
            this.squares.push(row);
        }
    }

    /**
     * Get the square at (x, y) with the bottom left
     * square as the origin point (0, 0)
     * @param {Number} x
     * @param {Number} y
     */
    square(x, y) {
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            return undefined;
        }
        return this.squares[y][x];
    }

    /**
     * This callback is executed once for each square on the board
     *
     * @callback SquareCallback
     * @param {Square} square
     */
    /**
     * Execute a function once for each square on the board
     * @param {SquareCallback} callback
     */
    iterate(callback) {
        this.squares.forEach(row => {
            row.forEach(sq => {
                callback(sq);
            });
        });
    }
}
