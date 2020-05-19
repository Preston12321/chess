import * as util from './util';
import { constants } from '../view/constants';
import { BoardView } from '../view/board-view';
import { Board } from '../model/board';
import { Square } from '../model/square';
import { Piece } from '../model/piece';
import { MoveRule, AbsoluteRule, RelativeRule, ListRule, DirectionalRule, ConditionalRule } from '../model/move-rule';
import { Move, RelativeMove, AbsoluteMove } from '../model/move';

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

        // TODO: Track the individual pieces instead of using kingLocation
        this.kingLocation = { "white": null, "black": null };
        this.recentLocation = { "white": null, "black": null };

        // TODO: Move canCastle into king-specific Piece class?
        this.canCastle = { "white": true, "black": true };

        util.setupChess(this.board, "white");
        this.view.update();

        this.view.onSquareClick(square => this.squareClick(square));
    }

    /**
     *
     * @param {Square} square
     */
    squareClick(square) {
        console.log(square);

        // NOTE: Changing parameter `event` to `square`

        if (this.moveLocked) return;

        // Find both kings and note their location if not already noted
        if (!(this.kingLocation[constants.pieceTeams.white]
            && this.kingLocation[constants.pieceTeams.black])) {
            // Search through board
            this.board.iterate((sq) => {
                let piece = sq.resident;
                if (piece && piece.type == constants.pieceTypes.king) {
                    this.kingLocation[piece.team] = sq;
                }
            });
        }

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

                this.recentLocation[this.turnTeam] = square;
                square.recent = true;
                this.clearStatuses(square);

                let piece = this.activeSquare.resident;

                this.enPassant = null;

                switch (piece.type) {
                    case constants.pieceTypes.pawn:
                        if (square.y == 3) {
                            this.enPassant = 7 - square.x;
                        }
                        if (this.activeSquare.y == 4) {
                            this.board.square(square.x, square.y - 1).resident = null;
                        }
                        break;

                    case constants.pieceTypes.rook:
                        this.canCastle[this.activeSquare.team()] = false;
                        break;

                    case constants.pieceTypes.king:
                        if (!this.canCastle[this.activeSquare.team()]) break;

                        this.canCastle[this.activeSquare.team()] = false;
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
                            var rook = this.board.square(x1, 0);
                            this.board.square(x2, 0).resident = rook.resident;
                            rook.resident = null;
                        }
                        break;
                }

                // Move piece to the clicked square
                square.resident = this.activeSquare.resident;
                this.activeSquare = null;

                this.moveLocked = true;
                if (this.isCheckmate()) {
                    alert(this.turnTeam + " won!");
                }
                else if (isStalemate()) {
                    alert("Draw by stalemate!");
                }
                this.kingLocation[constants.pieceTeams.white] = null;
                this.kingLocation[constants.pieceTeams.black] = null;

                let self = this;
                setTimeout(() => {
                    self.board.flip();
                    this.clearStatuses();
                    self.moveLocked = false;
                    self.turnTeam = (self.turnTeam == constants.pieceTeams.white)
                        ? constants.pieceTeams.black : constants.pieceTeams.white;
                    if (this.recentLocation[self.turnTeam])
                        this.recentLocation[self.turnTeam].recent = true;
                }, 1000);
                return;
            }
        }

        // No active square, let's see if this square has a piece with valid moves

        let team = square.resident.team;

        // Show moves if square is occupied by a player on their own turn
        if (!square.occupied || team != this.turnTeam) return;

        if (shouldWipe) {
            this.clearStatuses(this.recentLocation[team]);
        }

        this.activeSquare = square;
        square.active = true;

        let moves = this.availableMoves(square.resident);
        // let m = square.resident.

        if (!(moves && moves.length != 0)) return;

        for (var n = 0; n < moves.length; n++) {
            let sq = moves[n];

            if (sq.occupied) {
                sq.takeable = true;
                continue;
            }

            let check = this.board.square(sq.x, sq.y - 1);
            let enemyPawn = ((this.turnTeam == constants.pieceTeams.white)
                ? constants.pieceTeams.black : constants.pieceTeams.white)
                + "-" + constants.pieceTypes.pawn;

            if (sq.x == this.enPassant && sq.y == 5
                && square.piece() == constants.pieceTypes.pawn
                && check.resident == enemyPawn) {
                sq.takeable = true;
            }
            else {
                sq.open = true;
            }
        }
    }

    /**
     * Expand a given MoveRule into a list of valid moves for the given Piece
     * @param {MoveRule} rule
     * @param {Piece} piece
     * @returns {Array<AbsoluteMove>}
     */
    ruleToMoves(rule, piece) {
        /** @type {Array<AbsoluteMove>} */
        let moves = [];
        console.log(rule);

        if (rule instanceof AbsoluteRule) {
            moves.push(rule.move);
        }

        else if (rule instanceof RelativeRule) {
            let sq = piece.square;
            let absolute = new AbsoluteMove(sq.x + rule.move.x, sq.y + rule.move.y);
            moves.push(absolute);
        }


        else if (rule instanceof ListRule) {
            rule.rules.forEach(r => {
                moves = moves.concat(this.ruleToMoves(r, piece));
            });
        }

        else if (rule instanceof DirectionalRule) {
            console.log("Processing directional rule");
            let dir = rule.direction;
            // Look in steps along a direction defined by the rule
            for (let i = 1; i <= rule.extent; i++) {
                // Get square relative to the given piece
                let x = dir.x * i;
                let y = dir.y * i;
                let square = this.board.square(piece.square.x + x, piece.square.y + y);

                console.log(square);

                // If square doesn't exist, we've hit the edge of the board
                if (!square) break;

                let move = new AbsoluteMove(square.x, square.y);

                if (!rule.condition(move)) continue;

                // Add all empty squares
                if (!square.occupied) {
                    console.log("Adding move (" + move.x + ", " + move.y + ")");
                    moves.push(move);
                    continue;
                }

                // Square is non-empty; add move if it's an enemy piece
                if (square.resident.team != piece.team) {
                    console.log("Adding move (" + move.x + ", " + move.y + ")");
                    moves.push(move);
                }

                // Some piece blocks path; don't continue
                break;
            }
        }

        else if (rule instanceof ConditionalRule) {
            let move;

            let sq = piece.square;
            let r = rule.rule;
            if (r instanceof RelativeRule) {
                move = new AbsoluteMove(r.move.x + sq.x, r.move.y + sq.y);
            }
            else if (r instanceof AbsoluteRule) {
                move = r.move;
            }

            if (rule.isMet(move)) {
                moves.concat(this.ruleToMoves(r, piece));
            }
        }

        return moves;
    }

    // TODO: Convert availableMoves logic into MoveRule objects
    /**
     * Return a list of Square objects representing
     * all the valid moves for a given piece
     * @param {Piece} piece
     * @returns {Array<Square>}
     */
    availableMoves(piece) {
        let moves = this.ruleToMoves(piece.moveRule, piece);

        let result = [];
        moves.forEach(move => result.push(this.board.square(move.x, move.y)));

        console.log(result);

        return result;
    }

    // isCheckmate() {

    //     var enemyTeam = (this.turnTeam == constants.pieceTeams.white)
    //         ? constants.pieceTeams.black
    //         : constants.pieceTeams.white;

    //     var kingThreats = dangerousPieces(this.kingLocation[enemyTeam], enemyTeam);
    //     if (kingThreats == null) return false;

    //     return isStalemate();
    // }

    // isStalemate() {
    //     var enemyTeam = (this.turnTeam == constants.pieceTeams.white)
    //         ? constants.pieceTeams.black
    //         : constants.pieceTeams.white;

    //     var result = true;
    //     this.board.iterate(function (sq) {
    //         var moves = (sq.team() == enemyTeam) ? this.availableMoves(sq.resident) : null;
    //         if (moves) result = false;
    //         return;
    //     });

    //     return result;
    // }

    // // Returns all squares with pieces that would threaten
    // // the king if the given piece moved to the given square
    // endangersKing(origin, test) {
    //     var team = origin.team();
    //     return dangerousPieces(this.kingLocation[team], team, origin, test);
    // }

    // // Returns all squares with pieces that threaten the given square
    // dangerousPieces(square, team, ignore, test) {
    //     var result = [];
    //     // Create a unit square
    //     for (var j = -1; j <= 1; j++) {
    //         for (var k = -1; k <= 1; k++) {
    //             // Check for distant enemy pieces, and pawns
    //             for (var i = 1; i <= 7; i++) {
    //                 if (j == 0 && k == 0) continue;
    //                 var x = i * j;
    //                 var y = i * k;
    //                 var check = this.board.square(square.x + x, square.y + y);
    //                 if (!check) break;
    //                 if (ignore && check.element === ignore.element) continue;
    //                 if (check.team() == team) break;
    //                 if (test && check.element === test.element) break;
    //                 var piece = check.piece();
    //                 if (piece == "") continue;

    //                 // Immediate surroundings
    //                 if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
    //                     // King
    //                     if (piece == constants.pieceTypes.king) {
    //                         result[result.length] = check;
    //                     }
    //                     // Pawn
    //                     if (x != 0 && piece == constants.pieceTypes.pawn) {
    //                         if (this.turnTeam == team && y == 1)
    //                             result[result.length] = check;
    //                         if (this.turnTeam != team && y == -1)
    //                             result[result.length] = check;
    //                     }
    //                 }
    //                 // Diagonal
    //                 if (Math.abs(x) == Math.abs(y)) {
    //                     // Bishop and Queen (diagonal)
    //                     if (piece == constants.pieceTypes.bishop) {
    //                         result[result.length] = check;
    //                     }
    //                 }
    //                 // Vertical/Horizontal
    //                 else {
    //                     // Rook and Queen (vertical/horizontal)
    //                     if (piece == constants.pieceTypes.rook) {
    //                         result[result.length] = check;
    //                     }
    //                 }
    //                 // Queen
    //                 if (piece == constants.pieceTypes.queen) {
    //                     result[result.length] = check;
    //                 }
    //                 if (piece != "") break; // Stop when blocked
    //             }
    //         }
    //     }
    //     // Check for enemy knights
    //     for (var j = -1; j <= 1; j += 2) {
    //         for (var k = -2; k <= 2; k += 4) {
    //             for (var i = 0; i <= 1; i++) {
    //                 var x = (i == 0) ? j : k;
    //                 var y = (i == 0) ? k : j;
    //                 var check = this.board.square(square.x + x, square.y + y);
    //                 if (!check) continue;
    //                 if (check.team() == team) continue;
    //                 if (check.piece() == constants.pieceTypes.knight) {
    //                     result[result.length] = check;
    //                 }
    //             }
    //         }
    //     }
    //     return (result.length != 0) ? result : null;
    // }

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
}
