import { constants } from './constants';
import { Square } from '../model/square';

import $ from 'jquery';

export class SquareView extends Object {
    /**
     * @param {Square} square
     * @param {HTMLElement} [element]
     */
    constructor(square, element) {
        super();

        if (element) {
            this.element = $(element);
        }
        else {
            this.element = $("<div></div>");
        }

        this.square = square;

        if (!this.element.hasClass(constants.boardSquare)) {
            this.element.addClass(constants.boardSquare);
        }

        /** @type {clickCallback} */
        this._callback = null;

        let self = this;
        this.element.on("click", () => {
            let callback = self.clickCallback;

            if (callback) {
                callback(self.square);
            }
        });
    }

    /**
     *
     * @callback clickCallback
     * @param {Square} clicked
     */
    get clickCallback() { return this._callback; }

    /**
     * A callback to execute whenever a square on the board is clicked
     * @param {clickCallback} callback
     */
    set clickCallback(callback) {
        this._callback = callback;
    }

    /**
     * Set attributes of element based on Square model
     */
    update() {
        this.occupied(this.square.occupied);
        if (this.square.occupied) {
            this.resident(this.square.resident.name);
        }
        // TODO: Convert square status to decoration
    }

    /**
     * Sets whether the square is occupied by a piece
     * @param {Boolean} val
     */
    occupied(val) {
        if (val) {
            this.element.addClass(constants.occupied);
        }
        else {
            this.element.removeClass(constants.occupied);
        }
    }

    /**
     * Try to set the occupying piece
     * @param {String} name
     */
    resident(name) {
        let result = this.class(Object.values(constants.pieceNames), name);

        if (result == "") {
            this.element.removeClass(constants.occupied);
        }
        else {
            this.element.addClass(constants.occupied);
        }

        return result;
    }

    /**
     * Try to set element as decorated or not
     * @param {Boolean} val
     */
    decorated(val) {
        if (val) {
            this.element.addClass(constants.decorated);
            return true;
        }

        this.element.removeClass(constants.decorated);
        return false;
    }

    /**
     * Try to set the decoration
     * @param {String} name
     */
    decoration(name) {
        let result = this.class(Object.values(constants.decorationNames), name);

        if (result == "") {
            this.element.removeClass(constants.decorated);
        }
        else {
            this.element.addClass(constants.decorated);
        }

        return result;
    }

    /**
     * Return or set a class out of a list of possible class names
     * @param {Array<String>} classes
     * @param {String} [name]
     */
    class(classes, name) {
        let exists = false;
        let last = name;

        classes.forEach(cls => {
            if (this.element.hasClass(cls)) {
                // Note if element already has the name class
                if (cls == name) {
                    exists = true;
                    return;
                }

                // Remove all classes in the list except for name
                this.element.removeClass(cls);

                // Keep track of the last class seen from the list
                last = cls;
            }
        });

        // Class is already applied
        if (exists) {
            return name;
        }

        if (name) {
            // If name parameter is the empty string, clear all classes
            if (name == "") {
                return name;
            }

            // If name is in the list, add it
            if (classes.includes(name)) {
                this.element.addClass(name);
                return name;
            }

            console.error("Cannot set class that is not in list");
        }

        // Valid name not specified, add back the last seen class from the list
        this.element.addClass(last);
        return last;
    }
}
