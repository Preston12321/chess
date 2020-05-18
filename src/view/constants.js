// TODO: Clean up constants as much as possible

const delimiter = "-";
const decorationPrefix = "board-square";
const piecePrefixes = {
    "black": "black",
    "white": "white"
};
const pieceSuffixes = {
    "king": "king",
    "queen": "queen",
    "pawn": "pawn",
    "rook": "rook",
    "bishop": "bishop",
    "knight": "knight"
};

export const constants = {
    "chessBoard": "chess-board",
    "boardRow": "board-row",
    "boardSquare": "board-square",
    "decorated": "decorated",
    "occupied": "occupied",
    "decorationNames": {
        "active": decorationPrefix + delimiter + "active",
        "open": decorationPrefix + delimiter + "open",
        "takeable": decorationPrefix + delimiter + "takeable",
        "recent": decorationPrefix + delimiter + "recent"
    },
    "piecePrefixes": piecePrefixes,
    "pieceSuffixes": pieceSuffixes,
    "pieceNames": {
        "blackKing": piecePrefixes.black + delimiter + pieceSuffixes.king,
        "blackQueen": piecePrefixes.black + delimiter + pieceSuffixes.queen,
        "blackPawn": piecePrefixes.black + delimiter + pieceSuffixes.pawn,
        "blackRook": piecePrefixes.black + delimiter + pieceSuffixes.rook,
        "blackBishop": piecePrefixes.black + delimiter + pieceSuffixes.bishop,
        "blackKnight": piecePrefixes.black + delimiter + pieceSuffixes.knight,
        "whiteKing": piecePrefixes.white + delimiter + pieceSuffixes.king,
        "whiteQueen": piecePrefixes.white + delimiter + pieceSuffixes.queen,
        "whitePawn": piecePrefixes.white + delimiter + pieceSuffixes.pawn,
        "whiteRook": piecePrefixes.white + delimiter + pieceSuffixes.rook,
        "whiteBishop": piecePrefixes.white + delimiter + pieceSuffixes.bishop,
        "whiteKnight": piecePrefixes.white + delimiter + pieceSuffixes.knight
    }
};
