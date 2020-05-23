import { GameController } from '../src/controller/game';

import $ from 'jquery';

const boardId = "chess-board";

test("GameController is created properly", () => {
    $("body").append("<div id='" + boardId + "'></div>");

    let game = new GameController(boardId);
    expect(game).toHaveProperty("board");
    expect(game).toHaveProperty("view");
    expect(game).toHaveProperty("activeSquare");
    expect(game).toHaveProperty("turnTeam");
    expect(game).toHaveProperty("moveLocked");
    expect(game).toHaveProperty("kings");
    expect(game).toHaveProperty("recentSquares");
});
