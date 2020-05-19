// TODO: Maybe move constants into src/ instead of view/
// TODO: Clean up constants as much as possible

const delimiter = "-";
const decorationPrefix = "board-square";
const pieceTeams = {
    "black": "black",
    "white": "white"
};
const pieceTypes = {
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
    "pieceTeams": pieceTeams,
    "pieceTypes": pieceTypes,
    "pieceNames": {
        "blackKing": pieceTeams.black + delimiter + pieceTypes.king,
        "blackQueen": pieceTeams.black + delimiter + pieceTypes.queen,
        "blackPawn": pieceTeams.black + delimiter + pieceTypes.pawn,
        "blackRook": pieceTeams.black + delimiter + pieceTypes.rook,
        "blackBishop": pieceTeams.black + delimiter + pieceTypes.bishop,
        "blackKnight": pieceTeams.black + delimiter + pieceTypes.knight,
        "whiteKing": pieceTeams.white + delimiter + pieceTypes.king,
        "whiteQueen": pieceTeams.white + delimiter + pieceTypes.queen,
        "whitePawn": pieceTeams.white + delimiter + pieceTypes.pawn,
        "whiteRook": pieceTeams.white + delimiter + pieceTypes.rook,
        "whiteBishop": pieceTeams.white + delimiter + pieceTypes.bishop,
        "whiteKnight": pieceTeams.white + delimiter + pieceTypes.knight
    }
};
