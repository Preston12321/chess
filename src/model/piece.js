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

        this._moved = false;
    }

    get team() { return this._team; }
    get type() { return this._type; }
    get moveRule() { return this._moveRule; }
    get square() { return this._square; }
    get moved() { return this._moved; }

    // TODO: Fix this use of a hard-coded literal
    get name() { return this.team + "-" + this.type; }

    set square(square) {
        if (this.square) {
            this._moved = true;
        }
        this._square = square;
    }
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

export class Pawn extends Piece {
    /**
     * @param {String} team
     * @param {ConditionCallback} moveCondition
     */
    constructor(team, moveCondition) {
        const forward = (team == constants.pieceTeams.white) ? 1 : -1;
        super(
            team,
            constants.pieceTypes.pawn,
            new ListRule([
                // Immediately ahead
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(0, forward)),
                    (from, to) =>
                        moveCondition(from, to) &&
                        !to.occupied
                ),
                // Two squares forward
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(0, forward * 2)),
                    (from, to) =>
                        moveCondition(from, to) &&
                        !this.moved &&
                        !to.occupied &&
                        !from.board.square(from.x, from.y + forward).occupied
                ),
                // Taking diagonally/en passant
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(1, forward)),
                    (from, to) =>
                        moveCondition(from, to) && (
                            to.occupied || (
                                from.board.square(from.x + 1, from.y).occupied &&
                                from.board.square(from.x + 1, from.y).resident.team != team &&
                                from.board.square(from.x + 1, from.y).resident.type == constants.pieceTypes.pawn &&
                                from.board.square(from.x + 1, from.y).resident.enPassant
                            )
                        )
                ),
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(-1, forward)),
                    (from, to) =>
                        moveCondition(from, to) && (
                            to.occupied || (
                                from.board.square(from.x - 1, from.y).occupied &&
                                from.board.square(from.x - 1, from.y).resident.team != team &&
                                from.board.square(from.x - 1, from.y).resident.type == constants.pieceTypes.pawn &&
                                from.board.square(from.x - 1, from.y).resident.enPassant
                            )
                        )
                )
            ])
        );

        /** @type {Square} */
        this._square = null;

        this._enPassant = false;
    }

    get square() { return this._square; }
    get enPassant() { return this._enPassant; }

    set square(square) {
        if (this.square) {
            this._moved = true;

            const forward = (this.team == constants.pieceTeams.white) ? 1 : -1;

            // If piece moves forward by two squares, set enPassant status
            if (square && square.y == (this.square.y + forward * 2)) {
                this._enPassant = true;
            }
            else {
                this._enPassant = false;
            }
        }
        this._square = square;
    }

    set enPassant(enPassant) {
        if (!enPassant) {
            this._enPassant = false;
        }
    }
}

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
                // Immediately-surrounding squares
                new ConditionalRule(new RelativeRule(new RelativeMove(0, 1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(1, 1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(1, 0)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(1, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(0, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, -1)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, 0)), moveCondition),
                new ConditionalRule(new RelativeRule(new RelativeMove(-1, 1)), moveCondition),
                // Castle squares
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(2, 0)),
                    (from, to) =>
                        moveCondition(from, to) &&
                        // Make sure the piece hasn't moved
                        !this.moved &&
                        // Make sure the corresponding rook hasn't moved
                        // NOTE: We assume here the pieces were set up for a typical game
                        this.square.board.square(from.x + 3, from.y).occupied &&
                        !this.square.board.square(from.x + 3, from.y).resident.moved
                ),
                new ConditionalRule(
                    new RelativeRule(new RelativeMove(-2, 0)),
                    (from, to) =>
                        moveCondition(from, to) &&
                        // Make sure the piece hasn't moved
                        !this.moved &&
                        // Make sure the corresponding rook hasn't moved
                        // NOTE: We assume here the pieces were set up for a typical game
                        this.square.board.square(from.x - 4, from.y).occupied &&
                        !this.square.board.square(from.x - 4, from.y).resident.moved
                )
            ])
        );
    }
}
