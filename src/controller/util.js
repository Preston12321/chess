import { GameController } from './game';
import { constants } from '../view/constants';
import { Board } from '../model/board';
import { Piece } from '../model/piece';

import $ from 'jquery';

// TODO: Figure out what to do with this
export function setupGameWhenReady() {
    $(() => {
        window.game = new GameController();
        window.game.view.bindToElement($("#" + constants.chessBoard).get(0));
    });
}

export function wipeDecorations(chessBoard, except) {
    chessBoard.iterate(function (sq) {
        if (except) {
            if (sq.x() != except.x() || sq.y() != except.y()) {
                sq.decoration("");
            }
        }
        else {
            sq.decoration("");
        }
    });
}

// TODO: Move this into GameController class?
/**
 *
 * @param {Board} chessBoard
 * @param {String} turn
 */
export function setupChess(chessBoard, turn) {
    if (turn != "white" && turn != "black") return;

    const first = turn;
    const second = (turn == "white") ? "black" : "white";

    const pieces = ["rook", "knight", "bishop", "queen", "king",
        "bishop", "knight", "rook"];

    for (var x = 0; x < 8; x++) {
        chessBoard.square(x, 0).resident = new Piece(first, pieces[x], null);
        chessBoard.square(x, 1).resident = new Piece(first, "pawn", null);

        chessBoard.square(x, 6).resident = new Piece(second, "pawn", null);
        chessBoard.square(x, 7).resident = new Piece(second, pieces[x], null);
    }
}
