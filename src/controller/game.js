import { constants } from '../constants';
import { BoardView } from '../view/board-view';
import { Board } from '../model/board';
import { Square } from '../model/square';
import { Piece, Pawn, Bishop, Rook, Knight, Queen, King } from '../model/piece';
import { ConditionCallback } from '../model/move-rule';

// TODO: Optimize, optimize, optimize!
// TODO: Add detection for draw by three-fold repetition
export class GameController extends Object {
    constructor() {
        super();

        this.board = new Board();
        this.view = new BoardView(this.board);

        /** @type {Square} */
        this.activeSquare = null;
        this.turnTeam = constants.pieceTeams.white;
        this.moveLocked = false;
        this.enPassant = null;

        this.kings = {};
        this.kings[constants.pieceTeams.white] = null;
        this.kings[constants.pieceTeams.black] = null;

        this.recentSquares = {};
        this.recentSquares[constants.pieceTeams.white] = null;
        this.recentSquares[constants.pieceTeams.black] = null;

        // TODO: Move canCastle into king-specific Piece class?
        this.canCastle = { "white": true, "black": true };

        this.setupChess();
        this.view.update();

        this.view.onSquareClick(square => this.squareClick(square));
    }

    /**
     *
     * @param {Square} square
     */
    squareClick(square) {

        if (this.moveLocked) return;

        let shouldWipe = false;

        // If there is currently an active square, take action clicked by player
        if (this.activeSquare) {

            // TODO: Change check to a simple `square.active`?
            if (square === this.activeSquare) {
                this.activeSquare = null;
                this.clearStatuses();
                return;
            }

            shouldWipe = true;

            // If able to move this square, take necessary action
            if (square.open || square.takeable) {

                this.recentSquares[this.turnTeam] = square;
                square.recent = true;
                this.clearStatuses(square);

                const piece = this.activeSquare.resident;

                this.enPassant = null;

                switch (piece.type) {
                    case constants.pieceTypes.pawn:
                        // TODO: Fix en passant logic
                        if (square.y == 3) {
                            this.enPassant = 7 - square.x;
                        }
                        if (this.activeSquare.y == 4) {
                            this.board.square(square.x, square.y - 1).resident = null;
                        }
                        break;

                    case constants.pieceTypes.rook:
                        this.canCastle[piece.team] = false;
                        break;

                    case constants.pieceTypes.king:
                        if (!this.canCastle[piece.team]) break;

                        // TODO: Fix castle logic
                        this.canCastle[piece.team] = false;
                        let x1 = null;
                        let x2 = null;
                        switch (square.x) {
                            case 2:
                                x1 = 0;
                                x2 = 3;
                                break;

                            case 1:
                                x1 = 0;
                                x2 = 2;
                                break;

                            case 6:
                                x1 = 7;
                                x2 = 5;
                                break;

                            case 5:
                                x1 = 7;
                                x2 = 4;
                                break;
                        }

                        if (x1 && x2) {
                            const rook = this.board.square(x1, 0);
                            this.board.square(x2, 0).resident = rook.resident;
                            rook.resident = null;
                        }
                        break;
                }

                // Move piece to the clicked square
                square.resident = this.activeSquare.resident;
                this.activeSquare = null;

                this.view.update();

                this.moveLocked = true;
                if (this.isCheckmate()) {
                    alert(this.turnTeam + " won!");
                }
                else if (this.isStalemate()) {
                    alert("Draw by stalemate!");
                }

                const self = this;
                setTimeout(() => {
                    self.view.flip();
                    this.clearStatuses();

                    self.moveLocked = false;
                    self.turnTeam = (self.turnTeam == constants.pieceTeams.white)
                        ? constants.pieceTeams.black : constants.pieceTeams.white;

                    if (this.recentSquares[self.turnTeam]) {
                        this.recentSquares[self.turnTeam].recent = true;
                    }
                }, 1000);
                return;
            }
        }

        // No active square; show moves if square is occupied by a player on their own turn
        if (!square.occupied || square.resident.team != this.turnTeam) return;

        if (shouldWipe) {
            this.clearStatuses(this.recentSquares[square.resident.team]);
        }

        this.activeSquare = square;
        square.active = true;

        this.view.update();

        const moves = this.availableMoves(square.resident);

        if (moves.length == 0) return;

        moves.forEach(sq => {
            if (sq.occupied) {
                sq.takeable = true;
                return;
            }

            // TODO: Check if move is an en passant

            sq.open = true;
        });

        this.view.update();
    }

    /**
     * Return a list of Square objects representing
     * all the valid moves for a given piece
     * @param {Piece} piece
     * @returns {Array<Square>}
     */
    availableMoves(piece) {
        const moves = piece.moveRule.toMoves(piece);

        let result = [];
        const self = this;
        moves.forEach(move => {
            const square = self.board.square(move.x, move.y);
            if (square) {
                result.push(square);
            }
        });

        return result;
    }

    /**
     * @returns {boolean} Whether the current player has achieved checkmate against the other
     */
    isCheckmate() {
        const enemyTeam = (this.turnTeam == constants.pieceTeams.white)
            ? constants.pieceTeams.black
            : constants.pieceTeams.white;

        const kingThreats = this.dangerousPieces(this.kings[enemyTeam].square, enemyTeam);
        if (kingThreats.length == 0) return false;

        return this.isStalemate();
    }

    /**
     * @returns {boolean} Whether the game has reached a state of draw by stalemate
     */
    isStalemate() {
        const team = this.turnTeam;

        let result = true;
        this.board.iterate(sq => {
            if (!sq.occupied || sq.resident.team == team) return;

            const moves = this.availableMoves(sq.resident);
            if (moves.length != 0) {
                result = false;
            }
        });

        return result;
    }

    /**
     * Return a list of squares with pieces that would threaten
     * the king if the given piece moved to the given square
     * @param {Square} origin
     * @param {Square} test
     */
    endangersKing(origin, test) {
        const team = origin.resident.team;
        return this.dangerousPieces(this.kings[team].square, team, origin, test);
    }

    /**
     * Return a list of squares with pieces that threaten the given square
     * @param {Square} square The square to test
     * @param {String} team Which team to treat as the current player
     * @param {Square} [ignore] An optional square to ignore
     * @param {Square} [test] An optional square that can be specified to consider
     *      what would happen if a friendly piece were on that square
     * @returns {Array<Square>}
     */
    dangerousPieces(square, team, ignore, test) {
        let result = [];
        // Create a unit square
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (j == 0 && k == 0) continue;
                // Check for distant enemy pieces, and pawns
                for (let i = 1; i <= 7; i++) {
                    const x = i * j;
                    const y = i * k;
                    const check = this.board.square(square.x + x, square.y + y);

                    // We've hit the end of the board
                    if (!check) break;

                    // Ignore the given square, if it exists
                    if (ignore && check.x == ignore.x && check.y == ignore.y) {
                        continue;
                    }

                    // We've hit our hypothetical friendly piece
                    if (test && check.x === test.x && check.y === test.y) {
                        break;
                    }

                    // Empty square
                    if (!check.occupied) continue;

                    // We've hit a friendly piece
                    if (check.resident.team == team) {
                        break;
                    }

                    const type = check.resident.type;

                    // Immediate surroundings
                    if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
                        // King
                        if (type == constants.pieceTypes.king) {
                            result.push(check);
                        }
                        // Pawn
                        if (x != 0 && type == constants.pieceTypes.pawn) {
                            if (this.turnTeam == team && y == 1) {
                                result.push(check);
                            }
                            if (this.turnTeam != team && y == -1) {
                                result.push(check);
                            }
                        }
                    }
                    // Diagonal
                    if (Math.abs(x) == Math.abs(y)) {
                        // Bishop and Queen (diagonal)
                        if (type == constants.pieceTypes.bishop) {
                            result.push(check);
                        }
                    }
                    // Vertical/Horizontal
                    else {
                        // Rook and Queen (vertical/horizontal)
                        if (type == constants.pieceTypes.rook) {
                            result.push(check);
                        }
                    }
                    // Queen
                    if (type == constants.pieceTypes.queen) {
                        result.push(check);
                    }

                    // Blocked somehow; don't continue
                    break;
                }
            }
        }
        // Check for enemy knights
        for (let j = -1; j <= 1; j += 2) {
            for (let k = -2; k <= 2; k += 4) {
                for (let i = 0; i <= 1; i++) {
                    // Look man, IDK what I did here, but it works...
                    const x = (i == 0) ? j : k;
                    const y = (i == 0) ? k : j;
                    const check = this.board.square(square.x + x, square.y + y);

                    // Square is off the edge of the board
                    if (!check) continue;

                    // Square is empty; carry on
                    if (!check.occupied) continue;

                    // We hit a friendly piece
                    if (check.resident.team == team) continue;

                    if (check.resident.type == constants.pieceTypes.knight) {
                        result.push(check);
                    }
                }
            }
        }
        return result;
    }

    /**
     * Clear the status of every square on the board, then update the view
     * @param {Square} [except] An optional square that will retain its status
     */
    clearStatuses(except) {
        this.board.iterate(sq => {
            if (except && sq.x == except.x && sq.y == except.y) return;

            sq.clear = true;
        });
        this.view.update();
    }

    /**
     * Set up the board with pieces for a standard game of chess
     */
    setupChess() {
        const white = constants.pieceTeams.white;
        const black = constants.pieceTeams.black;

        const self = this;
        /** @type {ConditionCallback} */
        const condition = (from, to) => {
            console.log(to);
            // Make sure the move wouldn't endanger the king
            const dangers = self.endangersKing(from, to);
            if (dangers.length != 0) return false;

            // If not, and if square is empty, we can move there
            if (!to.occupied) return true;

            // If square is occupied by friendly piece, we can't
            if (to.resident.team == from.resident.team) return false;

            // Square must have enemy piece we can take
            return true;
        };

        this.board.square(0, 0).resident = new Rook(white, condition);
        this.board.square(1, 0).resident = new Knight(white, condition);
        this.board.square(2, 0).resident = new Bishop(white, condition);
        this.board.square(3, 0).resident = new Queen(white, condition);
        this.board.square(4, 0).resident = new King(white, condition);
        this.board.square(5, 0).resident = new Bishop(white, condition);
        this.board.square(6, 0).resident = new Knight(white, condition);
        this.board.square(7, 0).resident = new Rook(white, condition);

        this.board.square(0, 7).resident = new Rook(black, condition);
        this.board.square(1, 7).resident = new Knight(black, condition);
        this.board.square(2, 7).resident = new Bishop(black, condition);
        this.board.square(3, 7).resident = new Queen(black, condition);
        this.board.square(4, 7).resident = new King(black, condition);
        this.board.square(5, 7).resident = new Bishop(black, condition);
        this.board.square(6, 7).resident = new Knight(black, condition);
        this.board.square(7, 7).resident = new Rook(black, condition);

        for (let x = 0; x < 8; x++) {
            this.board.square(x, 1).resident = new Pawn(white, condition);
            this.board.square(x, 6).resident = new Pawn(black, condition);
        }

        this.kings[constants.pieceTeams.white] = this.board.square(4, 0).resident;
        this.kings[constants.pieceTeams.black] = this.board.square(4, 7).resident;
    }
}
