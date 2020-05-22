import WhiteKing from './view/style/pieces/WhiteKing.png';
import WhiteQueen from './view/style/pieces/WhiteQueen.png';
import WhiteBishop from './view/style/pieces/WhiteBishop.png';
import WhiteKnight from './view/style/pieces/WhiteKnight.png';
import WhiteRook from './view/style/pieces/WhiteRook.png';
import WhitePawn from './view/style/pieces/WhitePawn.png';
import BlackKing from './view/style/pieces/BlackKing.png';
import BlackQueen from './view/style/pieces/BlackQueen.png';
import BlackBishop from './view/style/pieces/BlackBishop.png';
import BlackKnight from './view/style/pieces/BlackKnight.png';
import BlackRook from './view/style/pieces/BlackRook.png';
import BlackPawn from './view/style/pieces/BlackPawn.png';

import './view/style/style.scss';

import { GameController } from './controller/game';
import { constants } from './constants';

import $ from 'jquery';

$(() => {
    const game = new GameController();
    game.view.bindToElement($("#" + constants.chessBoard).get(0));
    window.game = game;
});

// TODO: Add README and LICENSE files
// TODO: Add unit tests and CI pipeline
// TODO: Maybe trade dependency on JQuery for modern DOM features with polyfills
