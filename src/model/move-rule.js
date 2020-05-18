import { RelativeMove, AbsoluteMove } from './move';

export class MoveRule extends Object { }

export class RelativeRule extends MoveRule {
    /**
     * @param {RelativeMove} move
     */
    constructor(move) {
        super();
        this._move = move;
    }

    get move() { return this._move; }
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
}

export class DirectionalRule extends MoveRule {
    /**
     * @param {RelativeMove} direction
     * @param {Number} [extent]
     */
    constructor(direction, extent) {
        super();
        this._direction = direction;

        // Default to 8
        this._extent = (extent) ? extent : 8;
    }

    get direction() { return this._direction; }
    get extent() { return this._extent; }
}

export class ConditionalRule extends MoveRule {
    /**
     * This callback returns a boolean representing
     * whether an arbitrary condition has been met.
     * @callback ConditionCallback
     * @returns {Boolean}
     */

    /**
     *
     * @param {MoveRule} rule
     * @param {ConditionCallback} condition
     */
    constructor(rule, condition) {
        super();
        this._rule = rule;
        this._condition = condition;
    }

    get rule() { return this._rule; }
    get isMet() { return this._condition(); }
}
