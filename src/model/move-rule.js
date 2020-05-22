import { RelativeMove, AbsoluteMove } from './move';
import { Piece } from './piece';
import { Square } from './square';

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

        const sq = piece.square;
        moves.push(new AbsoluteMove(sq.x + this.move.x, sq.y + this.move.y));

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
        return [this.move];
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
        const moves = this.rule.toMoves(piece);

        const board = piece.square.board;
        let passed = true;
        const self = this;
        moves.forEach(rule => {
            const to = board.square(rule.x, rule.y);
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

        const from = piece.square;
        const board = from.board;

        const dir = this.direction;
        // Look in steps along a direction defined by the rule
        for (let i = 1; i <= this.extent; i++) {
            // Get square relative to the given piece
            const x = dir.x * i;
            const y = dir.y * i;
            const to = board.square(from.x + x, from.y + y);

            // If square doesn't exist, we've hit the edge of the board
            if (!to) break;

            const satisfied = this.condition && this.condition(from, to);
            const move = new AbsoluteMove(to.x, to.y);

            if (to.occupied) {
                // Square is non-empty; add move if it's an enemy piece
                if (satisfied && to.resident.team != piece.team) {
                    moves.push(move);
                }

                // Some piece blocks path; don't continue
                break;
            }

            if (satisfied) {
                // Add all empty squares that satisfy the condition
                moves.push(move);
            }
        }

        return moves;
    }
}
