import { MoveRule, ListRule, DirectionalRule, ConditionCallback } from './move-rule';
import { Square } from './square';
import { constants } from '../view/constants';
import { RelativeMove } from './move';

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
    get moveRule() { return this._moveRule; }

    // TODO: Fix this use of a hard-coded literal
    get name() { return this.team + "-" + this.type; }
}

export class Bishop extends Piece {
    /**
     * @param {String} team
     * @param {ConditionCallback} moveCondition
     */
    constructor(team, moveCondition) {
        super(
            team,
            constants.pieceTypes.bishop,
            new ListRule([
                new DirectionalRule(new RelativeMove(1, 1), moveCondition),
                new DirectionalRule(new RelativeMove(1, -1), moveCondition),
                new DirectionalRule(new RelativeMove(-1, -1), moveCondition),
                new DirectionalRule(new RelativeMove(-1, 1), moveCondition)
            ])
        );
    }
}

// TODO: Implement Rook
// TODO: Implement Queen
// TODO: Implement Knight
// TODO: Implement Pawn
// TODO: Implement King
