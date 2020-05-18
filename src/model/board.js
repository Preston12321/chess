import { Square } from "./square";

export class Board extends Object {
    constructor() {
        super();

        /** @type {Array<Array<Square>>} */
        this.squares = [];

        for (let y = 0; y < 8; y++) {
            let row = [];
            for (let x = 0; x < 8; x++) {
                row.push(new Square(x, y));
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

    // TODO: Consider moving turnClockwise and flip into BoardView class
    // (This would mean the Board never actually flips, just the view arrangment)

    /**
     * Rotate all pieces and decorations 90 degrees
     * clockwise a specified amount of turns
     * @param {Number} turns
     */
    turnClockwise(turns) {
        if ((turns % 4) < 1) return;

        var squares = [];
        this.iterate(sq => {
            squares[sq.x + sq.y * 8] = {
                "decoration": sq.decoration(),
                "resident": sq.resident
            };
        });

        this.iterate(sq => {
            let old = squares[7 - sq.y + sq.x * 8];
            sq.decoration(old.decoration);
            sq.resident(old.resident);
        });

        this.turnClockwise(turns - 1);
    }

    /**
     * This is a convenience function for
     * [turnClockwise(2)]{@linkcode Board#turnClockwise}
     */
    flip() {
        this.turnClockwise(2);
    }
}
