import { GameController } from './game';
import { constants } from '../view/constants';
import { Board } from '../model/board';
import { Piece, Bishop } from '../model/piece';

import $ from 'jquery';

// TODO: Figure out what to do with this
export function setupGameWhenReady() {
    $(() => {
        window.game = new GameController();
        window.game.view.bindToElement($("#" + constants.chessBoard).get(0));
    });
}
