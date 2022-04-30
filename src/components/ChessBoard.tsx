import React from 'react'
import { Box, Text } from 'ink'
import { Coordinates, squareToCoordinates, fenToGameState, Pieces, Dot, isWhite, isBlack } from '../chess'
import { blackPieceColour, inCheckColour, startGradientColour, whitePieceColour } from '../colours'

export type ChessBoardProps = {
    fen: string
    lastMove?: {
        from: string
        to: string
    }
}

type GridHighlights = { [row: number]: number[] }

// Known based on the number of characters along the edge, would be better to generate this.
// TODO: generate, e.g. using https://github.com/vadimdemedes/ink#measureelementref
export const chessBoardWidth = 33

// Padding applied to each piece element in each square
const boardPadding = 1

export default function ChessBoard (props: ChessBoardProps) {
  const { pieces, inCheckSquare } = fenToGameState(props.fen)
  let gridHighlights: GridHighlights = []
  if (props.lastMove !== undefined) {
    const lastMoveFrom = squareToCoordinates(props.lastMove.from)
        pieces[lastMoveFrom.row]![lastMoveFrom.col] = Dot
        gridHighlights = identifyGridHighlights(lastMoveFrom, squareToCoordinates(props.lastMove.to))
  }
  const skeletonRow = [header(gridHighlights[0] ?? [], 'header')]
  for (let i = 0; i < pieces.length; i++) {
    const highlights = gridHighlights[skeletonRow.length] ?? []
    const checkCol = inCheckSquare?.row === i ? inCheckSquare?.col : undefined
    skeletonRow.push(pieceRow(pieces[i]!, highlights, 'pieces' + String(i), checkCol))
    if (i === pieces.length - 1) {
      skeletonRow.push(footer(gridHighlights[skeletonRow.length] ?? [], 'footer'))
    } else {
      skeletonRow.push(separator(gridHighlights[skeletonRow.length] ?? [], 'separator' + String(i)))
    }
  }

  return (
        <Box flexDirection='column'>
            {skeletonRow}
        </Box>
  )
}

const dataSeparator = '│'

function pieceRow (row: Pieces[], rowHighlights: number[], key: string, checkCol?: number) {
  const paddingStr = ' '.repeat(boardPadding)
  const rowElements: JSX.Element[] = []
  addRowElement(dataSeparator, rowElements, rowHighlights)
  for (let i = 0; i < row.length; i++) {
    addPieceElement(row[i]!, rowHighlights, paddingStr, rowElements, checkCol === i)
    addRowElement(dataSeparator, rowElements, rowHighlights)
  }
  return (<Box flexDirection='row' key={key}>
                {rowElements}
            </Box>)
}

type SkeletonChars = {
    left: string,
    right: string,
    cross: string,
    line: string
}

const header = skeletonRow({ left: '┌', cross: '┬', line: '─', right: '┐' })
const footer = skeletonRow({ left: '└', cross: '┴', line: '─', right: '┘' })
const separator = skeletonRow({ left: '├', cross: '┼', line: '─', right: '┤' })

function skeletonRow (chars: SkeletonChars) {
  return (rowHighlights: number[], key: string) => {
    const rowElements: JSX.Element[] = []
    addSkeletonElement(chars.left, rowElements, rowHighlights)
    for (let i = 0; i <= 7; i++) { // Board is 8 by 8
      addSkeletonElement(chars.line.repeat(1 + boardPadding * 2), rowElements, rowHighlights)
      if (i === 7) {
        addSkeletonElement(chars.right, rowElements, rowHighlights)
      } else {
        addSkeletonElement(chars.cross, rowElements, rowHighlights)
      }
    }
    return (<Box flexDirection='row' key={key}>
            {rowElements}
        </Box>)
  }
}

function addSkeletonElement (element: string, rowElements: JSX.Element[], rowHighlights: number[]): void {
  const shouldHighlight = rowHighlights.includes(rowElements.length)
  rowElements.push(<Text key={rowElements.length} bold={true} color={shouldHighlight ? startGradientColour : undefined}>{element}</Text>)
}

function addPieceElement (element: Pieces, rowHighlights: number[], paddingStr: string, rowElements: JSX.Element[], inCheck = false): void {
  let pieceColour: string | undefined
  if (rowHighlights.includes(rowElements.length)) {
    pieceColour = startGradientColour
  } else if (inCheck) {
    pieceColour = inCheckColour
  } else if (isWhite(element)) {
    pieceColour = whitePieceColour
  } else if (isBlack(element)) {
    pieceColour = blackPieceColour
  }
  rowElements.push(<Text key={rowElements.length} bold={true} color={pieceColour}>{`${paddingStr}${element}${paddingStr}`}</Text>)
}

function addRowElement (element: string, rowElements: JSX.Element[], rowHighlights: number[]): void {
  const shouldHighlight = rowHighlights.includes(rowElements.length)
  rowElements.push(<Text key={rowElements.length} bold={true} color={shouldHighlight ? startGradientColour : undefined}>{element}</Text>)
}

function identifyGridHighlights (fromSquare: Coordinates, toSquare: Coordinates): GridHighlights {
  const gridHighlights: GridHighlights = {}
  const dataCoordinate = (rowOrCol: number) => rowOrCol * 2 + 1

  // highlight to-square edges
  const dataRow = dataCoordinate(toSquare.row)
  const headerRow = dataRow - 1
  const footerRow = dataRow + 1
  const dataCol = dataCoordinate(toSquare.col)
  const preDataCol = dataCol - 1
  const postDataCol = dataCol + 1
  gridHighlights[headerRow] = [dataCol]
  gridHighlights[dataRow] = [preDataCol, postDataCol]
  gridHighlights[footerRow] = [dataCol]

  // highlight from-square data (a Dot)
  const rowHighlights = gridHighlights[dataCoordinate(fromSquare.row)] || []
  gridHighlights[dataCoordinate(fromSquare.row)] = [...rowHighlights, dataCoordinate(fromSquare.col)]
  return gridHighlights
}
