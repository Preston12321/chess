import { constants } from '../constants';
import { Board } from '../model/board';
import { Square } from '../model/square';
import { SquareView } from './square-view';

import $ from 'jquery';

export class BoardView extends Object {
    /**
     * @param {Board} board
     * @param {HTMLElement} [element]
     */
    constructor(board, element) {
        super();

        if (element) {
            this.element = $(element);
        }
        else {
            this.element = $("<div></div>");
        }

        this.board = board;

        if (!this.element.hasClass(constants.chessBoard)) {
            this.element.addClass(constants.chessBoard);
        }

        /** @type {Array<Array<SquareView>>} */
        this.squares = [];

        // Create new SquareView objects and add them to the DOM
        for (let y = board.squares.length - 1; y >= 0; y--) {
            let row = [];
            let e = $("<div></div>").addClass(constants.boardRow);

            for (let x = 0; x < board.squares[y].length; x++) {
                const square = new SquareView(board.square(x, y));
                row.push(square);
                e.append(square.element);
            }

            this.squares.push(row);
            this.element.append(e);
        }
    }

    /**
     *
     * @callback clickCallback
     * @param {Square} clicked
     */
    /**
     * Set a callback to execute whenever a square on the board is clicked
     * @param {clickCallback} callback
     */
    onSquareClick(callback) {
        this.squares.forEach(row => {
            row.forEach(square => {
                square.clickCallback = callback;
            });
        });
    }

    update() {
        this.squares.forEach(row => {
            row.forEach(square => {
                square.update();
            });
        });
        // TODO: Check BoardView's HTML during update?
    }

    /**
     * Replace the given DOM element with this BoardView representation
     * @param {HTMLElement} element
     */
    bindToElement(element) {
        this.element = $(element).replaceWith(this.element);
    }

    /**
     * Rotate all pieces and decorations 90 degrees clockwise a
     * specified amount of turns. NOTE: You must call `update()`
     * after calling this method or the view will not change
     * @param {Number} turns
     */
    turnClockwise(turns) {
        if ((turns % 4) < 1) return;

        let squares = [];
        this.squares.forEach(row => {
            row.forEach(square => {
                const sq = square.square;
                squares[sq.x + sq.y * 8] = sq;
            });
        });

        this.squares.forEach(row => {
            row.forEach(square => {
                const current = square.square;
                const swap = squares[7 - current.y + current.x * 8];
                square.square = swap;
            });
        });

        this.turnClockwise(turns - 1);
    }

    /**
     * This is a convenience function for `turnClockwise(2)`. Unlike
     * `turnClockwise()`, the `update()` method is called for you, so
     * you do not need to call it after invoking this method
     */
    flip() {
        this.turnClockwise(2);
        this.update();
    }
}
