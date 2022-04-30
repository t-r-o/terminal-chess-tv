import { Chess, ChessInstance } from 'chess.js'

export const WhitePieces = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' } as const
export const BlackPieces = { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' } as const
export const Dot = '\u00B7' as const
export const NoPiece = ' ' as const
type Values<T> = T[keyof T]
export type Pieces = Values<typeof WhitePieces> | Values<typeof BlackPieces> | typeof NoPiece | typeof Dot
export const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
export type Coordinates = { row: number, col: number }
const WhitePieceChars: string[] = Object.values(WhitePieces)
const BlackPieceChars: string[] = Object.values(BlackPieces)

export function fenToGameState (fen: string): { pieces: Pieces[][], inCheckSquare?: Coordinates } {
  const chess = new Chess(fen)
  const inCheckSquare = findCheckSquare(chess)
  const pieces = chess.board().map((rank) => {
    return rank.map((file) => {
      if (file === null) {
        return NoPiece
      }

      if (file.color === 'w') {
        return WhitePieces[file.type]
      } else {
        return BlackPieces[file.type]
      }
    })
  })
  return { pieces, inCheckSquare }
}

export function findCheckSquare (game: ChessInstance): Coordinates | undefined {
  const mover = game.turn()
  if (game.in_check()) {
    const board = game.board()
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r]!.length; c++) {
        const piece = board[r]![c]
        if (piece != null && piece.color === mover && piece.type === 'k') {
          return { row: r, col: c }
        }
      }
    }
  }
  return undefined
}

export function squareToCoordinates (square: string): Coordinates {
  const col = (square.charAt(0).codePointAt(0) as number) - 97
  const row = 8 - parseInt(square.charAt(1))
  return { row, col }
}

export function isBlack (piece: Pieces): boolean {
  return BlackPieceChars.includes(piece)
}

export function isWhite (piece: Pieces): boolean {
  return WhitePieceChars.includes(piece)
}
