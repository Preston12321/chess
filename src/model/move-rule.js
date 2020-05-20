import { RelativeMove, AbsoluteMove } from './move';
import { Piece } from './piece';
import { Square } from './square';
import { Board } from './board';

export class MoveRule extends Object {
    /**
     * Expand this rule into a list of valid moves for the given Piece
     * @param {Piece} piece
     * @returns {Array<AbsoluteMove>}
     */
    toMoves(piece) {
        return [];
    }
}

export class RelativeRule extends MoveRule {
    /**
     * @param {RelativeMove} move
     */
    constructor(move) {
        super();
        this._move = move;
    }

    get move() { return this._move; }

    /**
     * Expand this rule into a list of valid moves for the given Piece
     * @override
     * @param {Piece} piece
     * @returns {Array<AbsoluteMove>}
     */
    toMoves(piece) {
        /** @type {Array<AbsoluteMove>} */
        let moves = [];

        let sq = piece.square;
        let absolute = new AbsoluteMove(sq.x + this.move.x, sq.y + this.move.y);
        moves.push(absolute);

        return moves;
    }
}

export class AbsoluteRule extends MoveRule {
    /**
     * @param {AbsoluteMove} move
     */
    constructor(move) {
        super();
        this._move = move;
    }

    get move() { return this._move; }

    /**
     * Expand this rule into a list of valid moves for the given Piece
     * @override
     * @param {Piece} piece
     * @returns {Array<AbsoluteMove>}
     */
    toMoves(piece) {
        /** @type {Array<AbsoluteMove>} */
        let moves = [];

        moves.push(this.move);

        return moves;
    }
}

export class ListRule extends MoveRule {
    /**
     * @param {Array<MoveRule>} rules
     */
    constructor(rules) {
        super();
        this._rules = rules;
    }

    get rules() { return this._rules; }

    /**
     * Expand this rule into a list of valid moves for the given Piece
     * @override
     * @param {Piece} piece
     * @returns {Array<AbsoluteMove>}
     */
    toMoves(piece) {
        /** @type {Array<AbsoluteMove>} */
        let moves = [];

        this.rules.forEach(rule => {
            moves = moves.concat(rule.toMoves(piece));
        });

        return moves;
    }
}

/**
 * Returns a boolean representing whether an arbitrary condition
 * has been met. Both arguments are guaranteed to be non-null
 * @callback ConditionCallback
 * @param {Square} from
 * @param {Square} to
 * @returns {Boolean}
 */

export class ConditionalRule extends MoveRule {

    /**
     *
     * @param {AbsoluteRule|RelativeRule} rule
     * @param {ConditionCallback} condition
     */
    constructor(rule, condition) {
        super();
        this._rule = rule;
        this._condition = condition;
    }

    get rule() { return this._rule; }

    /**
     * @param {Square} from
     * @param {Square} to
     */
    isMet(from, to) { return this._condition(from, to); }

    /**
     * Expand this rule into a list of valid moves for the given Piece
     * @override
     * @param {Piece} piece
     * @returns {Array<AbsoluteMove>}
     */
    toMoves(piece) {
        /** @type {Array<AbsoluteMove>} */
        let moves = this.rule.toMoves(piece);

        let board = piece.square.board;
        let passed = true;
        let self = this;
        moves.forEach(rule => {
            let to = board.square(rule.x, rule.y);
            if (!to) return;

            if (!self.isMet(piece.square, to)) {
                passed = false;
            }
        });

        if (!passed) return [];

        return moves;
    }
}

export class DirectionalRule extends MoveRule {
    /**
     * @param {RelativeMove} direction
     * @param {ConditionCallback} [condition] An optional condition to check for each possible move
     * @param {Number} [extent]
     */
    constructor(direction, condition, extent) {
        super();
        this._direction = direction;
        this._condition = condition;

        // Default to 8
        this._extent = (extent) ? extent : 8;
    }

    get direction() { return this._direction; }
    get condition() { return this._condition; }
    get extent() { return this._extent; }

    /**
     * Expand this rule into a list of valid moves for the given Piece
     * @override
     * @param {Piece} piece
     * @returns {Array<AbsoluteMove>}
     */
    toMoves(piece) {
        /** @type {Array<AbsoluteMove>} */
        let moves = [];

        let from = piece.square;
        let board = from.board;

        let dir = this.direction;
        // Look in steps along a direction defined by the rule
        for (let i = 1; i <= this.extent; i++) {
            // Get square relative to the given piece
            let x = dir.x * i;
            let y = dir.y * i;
            let to = board.square(from.x + x, from.y + y);

            // If square doesn't exist, we've hit the edge of the board
            if (!to) break;

            let move = new AbsoluteMove(to.x, to.y);

            if (this.condition && !this.condition(from, to)) continue;

            // Add all empty squares
            if (!to.occupied) {
                moves.push(move);
                continue;
            }

            // Square is non-empty; add move if it's an enemy piece
            if (to.resident.team != piece.team) {
                moves.push(move);
            }

            // Some piece blocks path; don't continue
            break;
        }

        return moves;
    }
}
