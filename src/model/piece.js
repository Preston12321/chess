import { MoveRule, ListRule, DirectionalRule, ConditionCallback, ConditionalRule, RelativeRule } from './move-rule';
import { Square } from './square';
import { constants } from '../constants';
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
        this._square = null;
    }

    get team() { return this._team; }
    get type() { return this._type; }
    get moveRule() { return this._moveRule; }
    get square() { return this._square; }

    // TODO: Fix this use of a hard-coded literal
    get name() { return this.team + "-" + this.type; }

    set square(square) { this._square = square; }
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

export class Rook extends Piece {
    /**
     * @param {String} team
     * @param {ConditionCallback} moveCondition
     */
    constructor(team, moveCondition) {
        super(
            team,
            constants.pieceTypes.rook,
            new ListRule([
                new DirectionalRule(new RelativeMove(0, 1), moveCondition),
                new DirectionalRule(new RelativeMove(1, 0), moveCondition),
                new DirectionalRule(new RelativeMove(0, -1), moveCondition),
                new DirectionalRule(new RelativeMove(-1, 0), moveCondition)
            ])
        );
    }
}

export class Queen extends Piece {
    /**
     * @param {String} team
     * @param {ConditionCallback} moveCondition
     */
    constructor(team, moveCondition) {
        super(
            team,
            constants.pieceTypes.queen,
            new ListRule([
                // Horizontal/Vertical
                new DirectionalRule(new RelativeMove(0, 1), moveCondition),
                new DirectionalRule(new RelativeMove(1, 0), moveCondition),
                new DirectionalRule(new RelativeMove(0, -1), moveCondition),
                new DirectionalRule(new RelativeMove(-1, 0), moveCondition),
                // Diagonal
                new DirectionalRule(new RelativeMove(1, 1), moveCondition),
                new DirectionalRule(new RelativeMove(1, -1), moveCondition),
                new DirectionalRule(new RelativeMove(-1, -1), moveCondition),
                new DirectionalRule(new RelativeMove(-1, 1), moveCondition)
            ])
        );
    }
}

export class Knight extends Piece {
    /**
     * @param {String} team
     * @param {ConditionCallback} moveCondition
     */
    constructor(team, moveCondition) {
        super(
            team,
            constants.pieceTypes.knight,
            new ListRule([
                // Horizontal/Vertical
                new ConditionalRule(new RelativeRule(new RelativeMove(1, 2)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(2, 1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(2, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(1, -2)), moveCondition),
                // Diagonal
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, -2)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-2, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-2, 1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, 2)), moveCondition)
            ])
        );
    }
}

// TODO: Implement Pawn enPassant
export class Pawn extends Piece {
    /**
     * @param {String} team
     * @param {ConditionCallback} moveCondition
     */
    constructor(team, moveCondition) {
        let y = team == constants.pieceTeams.white ? 1 : -1;
        super(
            team,
            constants.pieceTypes.pawn,
            new ListRule([
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(0, y)),
                    (from, to) => moveCondition(from, to) && !to.occupied
                ),
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(0, y * 2)),
                    (from, to) => moveCondition(from, to) && !this._moved && !to.occupied && !from.board.square(from.x, from.y + y).occupied
                ),
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(1, y)),
                    (from, to) => to.occupied && to.resident.team != team && moveCondition(from, to)
                ),
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(-1, y)),
                    (from, to) => to.occupied && to.resident.team != team && moveCondition(from, to)
                )
            ])
        );

        this._moved = false;
    }

    get square() { return this._square; }

    /**
     * @override
     * @param {Square} square
    */
    set square(square) {
        if (this.square) {
            this._moved = true;
        }
        this._square = square;
    }
}

// TODO: Finish King implementation
export class King extends Piece {
    /**
     * @param {String} team
     * @param {ConditionCallback} moveCondition
     */
    constructor(team, moveCondition) {
        super(
            team,
            constants.pieceTypes.king,
            new ListRule([
                new ConditionalRule(new RelativeRule(new RelativeMove(0, 1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(1, 1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(1, 0)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(1, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(0, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, 0)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, 1)), moveCondition)
            ])
        );
    }
}
