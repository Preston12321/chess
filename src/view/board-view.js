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

        /** @type {JQuery<HTMLElement>} */
        this.element = null;
        if (element) {
            this.element = $(element);
        }
        else {
            this.element = $("<div></div>");
        }

        if (!this.element.hasClass(constants.chessBoard)) {
            this.element.addClass(constants.chessBoard);
        }

        /** @type {JQuery<HTMLElement>} */
        this.overlayElement = null;

        this.board = board;

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

    /**
     * Called whenever a modal dialog is cancelled
     * @callback CancelCallback
     */
    /**
     * Show a modal dialog with the given content,
     * executing `onCancel` if the dialog is dismissed.
     * @param {HTMLElement|JQuery<HTMLElement>} [child] The content of the modal
     * @param {CancelCallback} [onCancel] Called if the dialog is dismissed
     */
    showModal(child, onCancel) {
        // If a modal already exists, do nothing
        if (this.overlayElement) return false;

        // Create overlay to darken the screen
        this.overlayElement = $("<div></div>").addClass("shade-overlay").hide();;

        // Hide overlay and modal when player clicks outside of modal
        const self = this;
        this.overlayElement.on("click", () => {
            self.hideModal();

            if (onCancel) {
                onCancel();
            }
        });

        // Create modal element and add the given contents
        let modal = $("<div></div>").addClass("modal-chooser");

        if (child) {
            modal.append(child);
        }

        // Make sure clicking in the modal doesn't trigger overlay click listener
        modal.on("click", (event) => { event.stopPropagation(); });

        // Add modal to the overlay then the overlay to the end of the document body
        this.overlayElement.append(modal);

        $("body").append(this.overlayElement);
        this.overlayElement.fadeIn();

        return true;
    }

    /**
     * If a modal dialog is currently being shown, hide it
     */
    hideModal() {
        // If no modal exists, do nothing
        if (!this.overlayElement) return false;

        // Fade out modal, then remove it from the DOM
        let overlay = this.overlayElement;
        overlay.fadeOut({
            complete: () => {
                overlay.remove();
            }
        });

        this.overlayElement = null;
        return true;
    }

    /**
     * Called when a choice is selected from
     * chooser modal dialog
     * @callback SelectionCallback
     * @param {String} choice
     */
    /**
     * Show a modal dialog with options for pawn promotion
     * @param {String} team The team for which to show the options
     * @param {SelectionCallback} onSelect The callback to execute if an option is selected
     * @param {CancelCallback} [onCancel] The callback to execute if the dialog is dismissed
     */
    showChooser(team, onSelect, onCancel) {
        if (this.overlayElement) return false;

        // Make the four choices
        let queen = $("<div></div>").addClass("choice").addClass(team + "-" + constants.pieceTypes.queen);
        let knight = $("<div></div>").addClass("choice").addClass(team + "-" + constants.pieceTypes.knight);
        let bishop = $("<div></div>").addClass("choice").addClass(team + "-" + constants.pieceTypes.bishop);
        let rook = $("<div></div>").addClass("choice").addClass(team + "-" + constants.pieceTypes.rook);

        // Call selection callback and hide modal if a choice is clicked
        const self = this;
        queen.on("click", () => { onSelect(constants.pieceTypes.queen); self.hideModal(); });
        knight.on("click", () => { onSelect(constants.pieceTypes.knight); self.hideModal(); });
        bishop.on("click", () => { onSelect(constants.pieceTypes.bishop); self.hideModal(); });
        rook.on("click", () => { onSelect(constants.pieceTypes.rook); self.hideModal(); });

        // Add choices along with header and description to modal body
        let dist = $("<div></div>").addClass(["distribute", "flex-even"]);
        dist.append([queen, knight, bishop, rook]);

        let message = $("<h2>Promote Pawn</h2>").addClass(["centered-padding", "chooser-header"]);

        let head = $("<div></div>").addClass("flex-even");
        head.append(message);

        let description = $("<p></p>").addClass(["centered-padding", "chooser-description"]);
        description.text("Choose a piece to promote your pawn to. Or click outside this window to cancel your move.");

        let foot = $("<div></div>").addClass("flex-even");
        foot.append(description);

        let content = $("<div></div>").addClass("chooser-content");
        content.append([head, dist, foot]);

        return this.showModal(content, onCancel);
    }

}
