import { MoveRule } from './move-rule';
import { Square } from './square';

export class Piece extends Object {
    /**
     * @param {String} team
     * @param {String} type
     * @param {MoveRule} moveRule
     */
    constructor(team, type, moveRule) {
        super();
        this._team = team;
        this._type = type;
        this._moveRule = moveRule;

        /** @type {Square} */
        this.square = null;
    }

    get team() { return this._team; }
    get type() { return this._type; }

    // TODO: Fix this use of a hard-coded literal
    get name() { return this.team + "-" + this.type; }
}
