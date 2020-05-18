import * as util from './util';
import { constants } from '../view/constants';
import { BoardView } from '../view/board-view';
import { Board } from '../model/board';
import { Square } from '../model/square';

// TODO: Optimize, optimize, optimize!
// TODO: Add detection for draw by three-fold repetition
export class GameController extends Object {
    constructor() {
        super();

        this.board = new Board();
        this.view = new BoardView(this.board);

        this.activeSquare = null;
        this.turnTeam = constants.piecePrefixWhite;
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

        //     var square = this.chessBoard.square(event.target);
        //     var squareTeam = square.resident.team();

        // Find both kings and note their location if not already noted
        if (!(this.kingLocation[constants.piecePrefixWhite]
            && this.kingLocation[constants.piecePrefixBlack])) {
            // Search through board
            this.board.iterate((sq) => {
                let piece = sq.resident;
                if (piece && piece.type == constants.pieceSuffixKing) {
                    this.kingLocation[piece.team] = sq;
                }
            });
        }

        let shouldWipe = false;

        if (this.activeSquare) {
            // TODO: Change check to a simple `square.active`?
            if (square === this.activeSquare) {
                this.activeSquare = null;
                util.wipeDecorations(this.board);
                return;
            }
            else {
                shouldWipe = true;
            }

            var dec = square.decoration();
            if (dec == constants.decoratedOpen || dec == constants.decoratedTakeable) {
                square.resident(this.activeSquare.resident());
                this.recentLocation[this.turnTeam] = square;
                square.decoration(constants.decoratedRecent);
                util.wipeDecorations(this.board, square);
                var piece = this.activeSquare.piece();
                this.enPassant = null;
                if (piece == constants.pieceSuffixPawn) {
                    if (square.y() == 3) this.enPassant = 7 - square.x();
                    if (this.activeSquare.y() == 4) {
                        this.board.square(square.x(), square.y() - 1).resident("");
                    }
                }
                if (piece == constants.pieceSuffixRook)
                    this.canCastle[this.activeSquare.team()] = false;
                if (piece == constants.pieceSuffixKing) {
                    if (this.canCastle[this.activeSquare.team()]) {
                        this.canCastle[this.activeSquare.team()] = false;
                        var squareX = square.x();
                        var x1 = null;
                        var x2 = null;
                        if (squareX == 2) {
                            x1 = 0;
                            x2 = 3;
                        }
                        if (squareX == 1) {
                            x1 = 0;
                            x2 = 2;
                        }
                        if (squareX == 6) {
                            x1 = 7;
                            x2 = 5;
                        }
                        if (squareX == 5) {
                            x1 = 7;
                            x2 = 4;
                        }
                        if (x1 && x2) {
                            var rook = this.board.square(x1, 0);
                            this.board.square(x2, 0).resident(rook.resident());
                            rook.resident("");
                        }
                    }
                }
                this.activeSquare.resident("");
                this.activeSquare = null;
                this.moveLocked = true;
                if (isCheckmate()) alert(this.turnTeam + " won!");
                else if (isStalemate()) alert("Draw by stalemate!");
                this.kingLocation[constants.piecePrefixWhite] = null;
                this.kingLocation[constants.piecePrefixBlack] = null;
                setTimeout(function () {
                    util.wipeDecorations(this.chessBoard);
                    this.chessBoard.flip();
                    this.moveLocked = false;
                    this.turnTeam = (this.turnTeam == constants.piecePrefixWhite)
                        ? constants.piecePrefixBlack : constants.piecePrefixWhite;
                    if (this.recentLocation[this.turnTeam])
                        this.recentLocation[this.turnTeam].decoration(constants.decoratedRecent);
                }, 1000);
                return;
            }
        }

        //     if (square.occupied() && squareTeam == this.turnTeam) {

        //         if (shouldWipe) util.wipeDecorations(this.chessBoard, this.recentLocation[squareTeam]);

        //         this.activeSquare = square;
        //         square.decoration(constants.decoratedActive);

        //         var moves = availableMoves(square);

        //         if (moves && moves.length != 0) {
        //             for (var n = 0; n < moves.length; n++) {
        //                 var sq = moves[n];
        //                 if (sq.occupied()) {
        //                     sq.decoration(constants.decoratedTakeable);
        //                 }
        //                 else {
        //                     var check = this.chessBoard.square(sq.x(), sq.y() - 1);
        //                     var enemyPawn = ((this.turnTeam == constants.piecePrefixWhite)
        //                         ? constants.piecePrefixBlack : constants.piecePrefixWhite)
        //                         + "-" + constants.pieceSuffixPawn;
        //                     if (sq.x() == this.enPassant && sq.y() == 5
        //                         && square.piece() == constants.pieceSuffixPawn
        //                         && check.resident() == enemyPawn) {
        //                         sq.decoration(constants.decoratedTakeable);
        //                     }
        //                     else {
        //                         sq.decoration(constants.decoratedOpen);
        //                     }
        //                 }
        //             }
        //         }

        //     }

    }

    /**
     * Expand a given MoveRule into a list of valid moves for the given Piece
     * @param {MoveRule} rule
     * @param {Piece} piece
     */
    ruleToMoves(rule, piece) {
        /** @type {Array<Move>} */
        let moves = [];

        if (rule instanceof RelativeRule || rule instanceof AbsoluteRule) {
            moves.push(rule.move);
        }

        if (rule instanceof ListRule) {
            rule.rules.forEach(r => {
                moves.concat(ruleToMoves(r, piece));
            });
        }

        if (rule instanceof DirectionalRule) {
            // TODO: Implement directional rule expansion
        }

        if (rule instanceof ConditionalRule) {
            if (rule.isMet) {
                moves.concat(ruleToMoves(rule.rule, piece));
            }
        }

        return moves;
    }

    // // TODO: Convert availableMoves logic into MoveRule objects
    // availableMoves(square) {
    //     var moves = [];

    //     var squareTeam = square.team();
    //     var squareX = square.x();
    //     var squareY = square.y();

    //     var isQueen = false;
    //     switch (square.piece()) {
    //         case constants.pieceSuffixKing:
    //             if (this.canCastle[squareTeam] && squareY == 0
    //                 && dangerousPieces(square, squareTeam) == null) {
    //                 for (var i = -1; i <= 1; i += 2) {
    //                     for (var n = 1; n <= 2; n++) {
    //                         var x = n * i;
    //                         var check = this.chessBoard.square(squareX + x, squareY);
    //                         if (!check || check.occupied()) break;
    //                         if (dangerousPieces(check, squareTeam)) break;
    //                         else if (Math.abs(x) == 2) moves[moves.length] = check;
    //                     }
    //                 }
    //             }
    //             for (var x = -1; x <= 1; x++) {
    //                 for (var y = -1; y <= 1; y++) {
    //                     if (x == 0 && y == 0) continue; // Skip self
    //                     var check = this.chessBoard.square(squareX + x, squareY + y);
    //                     if (!check) continue; // Skip nonexistent squares
    //                     if (dangerousPieces(check, squareTeam) == null) {
    //                         if (check.team() != squareTeam)
    //                             moves[moves.length] = check;
    //                     }
    //                 }
    //             }
    //             break;
    //         case constants.pieceSuffixPawn:
    //             var check;
    //             for (var y = 1; y <= 2; y++) {
    //                 if (squareY != 1 && y == 2) break;
    //                 if (squareTeam != this.turnTeam) y *= -1;
    //                 check = this.chessBoard.square(squareX, squareY + y);
    //                 if (check && !check.occupied()
    //                     && endangersKing(square, check) == null) {
    //                     moves[moves.length] = check;
    //                 }
    //                 else {
    //                     break;
    //                 }
    //             }
    //             for (var x = -1; x <= 1; x += 2) {
    //                 var y = 1;
    //                 if (squareTeam != this.turnTeam) y *= -1;
    //                 check = this.chessBoard.square(squareX + x, squareY + y);
    //                 if (!check) continue;
    //                 if (check.occupied() && check.team() != squareTeam
    //                     && endangersKing(square, check) == null) {
    //                     moves[moves.length] = check;
    //                 }
    //                 test = this.chessBoard.square(squareX + x, squareY);
    //                 if (this.enPassant && test && test.piece() == constants.pieceSuffixPawn
    //                     && squareY == 4 && this.enPassant == squareX + x)
    //                     moves[moves.length] = check;
    //             }
    //             break;
    //         case constants.pieceSuffixQueen:
    //             isQueen = true;
    //         case constants.pieceSuffixRook:
    //             for (var j = -1; j <= 1; j += 2) { // Neg./Pos. Directions
    //                 for (var k = 0; k < 2; k++) { // Row or column? (x or y)
    //                     for (var i = 1; i < 8; i++) { // Iterate outward
    //                         var n = i * j; // If j == -1 then n is negative
    //                         var check = (k == 0) // Switch between row/column
    //                             ? this.chessBoard.square(squareX, squareY + n)
    //                             : this.chessBoard.square(squareX + n, squareY);
    //                         if (!check) break;
    //                         if (!check.occupied()) {
    //                             if (endangersKing(square, check) == null)
    //                                 moves[moves.length] = check;
    //                         }
    //                         else {
    //                             if (check.team() != squareTeam
    //                                 && endangersKing(square, check) == null) {
    //                                 moves[moves.length] = check;
    //                             }
    //                             break; // Some piece blocks path, don't continue
    //                         }
    //                     }
    //                 }
    //             }
    //             if (!isQueen) break;
    //         case constants.pieceSuffixBishop:
    //             for (var j = -1; j <= 1; j += 2) { // Neg./Pos. X direction
    //                 for (var k = -1; k <= 1; k += 2) { // Neg./Pos. Y direction
    //                     for (var i = 1; i < 8; i++) { // Iterate outward
    //                         var x = i * j;
    //                         var y = i * k;
    //                         var check =
    //                             this.chessBoard.square(squareX + x, squareY + y);
    //                         if (!check) break;
    //                         if (!check.occupied()) {
    //                             if (endangersKing(square, check) == null)
    //                                 moves[moves.length] = check;
    //                         }
    //                         else {
    //                             if (check.team() != squareTeam
    //                                 && endangersKing(square, check) == null) {
    //                                 moves[moves.length] = check;
    //                             }
    //                             break; // Some piece blocks path, don't continue
    //                         }
    //                     }
    //                 }
    //             }
    //             break;
    //         case constants.pieceSuffixKnight:
    //             for (var j = -1; j <= 1; j += 2) { // Neg./Pos. X direction
    //                 for (var k = -2; k <= 2; k += 4) { // Neg./Pos. Y direction
    //                     for (var i = 0; i <= 1; i++) { // Swap x and y?
    //                         var x = (i == 0) ? j : k;
    //                         var y = (i == 0) ? k : j;
    //                         var check =
    //                             this.chessBoard.square(squareX + x, squareY + y);
    //                         if (!check) continue;
    //                         if (!check.occupied()) {
    //                             if (endangersKing(square, check) == null)
    //                                 moves[moves.length] = check;
    //                         }
    //                         else if (check.team() != squareTeam
    //                             && endangersKing(square, check) == null) {
    //                             moves[moves.length] = check;
    //                         }
    //                     }
    //                 }
    //             }
    //             break;
    //     }

    //     return (moves.length != 0) ? moves : null;
    // }

    // isCheckmate() {

    //     var enemyTeam = (this.turnTeam == constants.piecePrefixWhite)
    //         ? constants.piecePrefixBlack
    //         : constants.piecePrefixWhite;

    //     var kingThreats = dangerousPieces(this.kingLocation[enemyTeam], enemyTeam);
    //     if (kingThreats == null) return false;

    //     return isStalemate();
    // }

    // isStalemate() {
    //     var enemyTeam = (this.turnTeam == constants.piecePrefixWhite)
    //         ? constants.piecePrefixBlack
    //         : constants.piecePrefixWhite;

    //     var result = true;
    //     this.chessBoard.iterate(function (sq) {
    //         var moves = (sq.team() == enemyTeam) ? availableMoves(sq) : null;
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
    //                 var check = this.chessBoard.square(square.x() + x, square.y() + y);
    //                 if (!check) break;
    //                 if (ignore && check.element === ignore.element) continue;
    //                 if (check.team() == team) break;
    //                 if (test && check.element === test.element) break;
    //                 var piece = check.piece();
    //                 if (piece == "") continue;

    //                 // Immediate surroundings
    //                 if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
    //                     // King
    //                     if (piece == constants.pieceSuffixKing) {
    //                         result[result.length] = check;
    //                     }
    //                     // Pawn
    //                     if (x != 0 && piece == constants.pieceSuffixPawn) {
    //                         if (this.turnTeam == team && y == 1)
    //                             result[result.length] = check;
    //                         if (this.turnTeam != team && y == -1)
    //                             result[result.length] = check;
    //                     }
    //                 }
    //                 // Diagonal
    //                 if (Math.abs(x) == Math.abs(y)) {
    //                     // Bishop and Queen (diagonal)
    //                     if (piece == constants.pieceSuffixBishop) {
    //                         result[result.length] = check;
    //                     }
    //                 }
    //                 // Vertical/Horizontal
    //                 else {
    //                     // Rook and Queen (vertical/horizontal)
    //                     if (piece == constants.pieceSuffixRook) {
    //                         result[result.length] = check;
    //                     }
    //                 }
    //                 // Queen
    //                 if (piece == constants.pieceSuffixQueen) {
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
    //                 var check = this.chessBoard.square(square.x() + x, square.y() + y);
    //                 if (!check) continue;
    //                 if (check.team() == team) continue;
    //                 if (check.piece() == constants.pieceSuffixKnight) {
    //                     result[result.length] = check;
    //                 }
    //             }
    //         }
    //     }
    //     return (result.length != 0) ? result : null;
    // }

}
