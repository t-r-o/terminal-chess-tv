import { Box, Spacer, Text } from 'ink'
import Gradient from 'ink-gradient'
import React from 'react'
import { Dot } from '../chess'
import { blackPieceColour, endGradientColour, gradientColours, titledPlayerColour, whitePieceColour } from '../colours'
import { Decisive, GameResult, Player, UIState } from '../types'
import { chessBoardWidth } from './ChessBoard'

export type GameInfoProps = Pick<UIState, 'white' | 'black' | 'mover' | 'lastMove' | 'result'>

export default function GameInfo (props: GameInfoProps) {
  return (
        <Box flexDirection='column' justifyContent='center' width={chessBoardWidth}>
            <PlayerPanel colour='white' player={props.white} mover={props.mover === 'white'}/>
            <PlayerPanel colour='black' player={props.black} mover={props.mover === 'black'}/>
            <GameResultBox result={props.result}/>
        </Box>
  )
}

function PlayerPanel (props: { colour: 'white' | 'black', player: Player, mover: boolean }) {
  const name = formatPlayerName(props.player.name, props.player.title !== undefined)
  const textColour = props.colour === 'white' ? whitePieceColour : blackPieceColour
  return (
            <Box>
                <Text bold={true} color={textColour}>{name}</Text>
                {props.player.title && <Text bold={true} color={titledPlayerColour}> {props.player.title}</Text>}
                <Text bold={true} color={textColour}> ({props.player.rating})</Text>
                <Spacer/>
                <Text bold={true} color={textColour}>{props.player.secondsRemaining + 's'} </Text>
                {props.mover ? <Text bold={true} color={endGradientColour}>{Dot}</Text> : <Text> </Text>}
            </Box>
  )
}

function GameResultBox (props: Pick<GameInfoProps, 'result'>) {
  const gameResult = props.result ? formatGameResult(props.result) : undefined
  if (gameResult === undefined) {
    return (
      <Box width={chessBoardWidth} height={1}/>
    )
  } else {
    return (
      <Box marginX={calculateGameEndPadding(gameResult)}><Gradient colors={gradientColours}><Text bold={true}>{gameResult}</Text></Gradient></Box>
    )
  }
}

export function LoadingGame () {
  return (
        <Box flexDirection='column' justifyContent='center' paddingLeft={10} paddingRight={10} marginTop={1}>
            <Gradient colors={gradientColours}><Text bold={true}>Loading next game...</Text></Gradient>
        </Box>
  )
}

const elipse = '...'
export function formatPlayerName (name: string, hasTitle: boolean): string {
  if (hasTitle && name.length > 16) {
    return name.slice(0, 13) + elipse
  }
  if (!hasTitle && name.length > 19) {
    return name.slice(0, 16) + elipse
  }
  return name
}

export function calculateGameEndPadding (gameEnd: string): number {
  return Math.floor((chessBoardWidth - gameEnd.length) / 2)
}

export function formatGameResult (gameResult: GameResult): string {
  const formatReason = (reason: Decisive['reason']) => reason === 'unknown' ? '' : ' by ' + reason
  if (gameResult.winner === 'draw') {
    return '1/2 - 1/2'
  } else if (gameResult.winner === 'unknown') {
    return 'Error moving to next game'
  } else if (gameResult.winner === 'white') {
    return '1-0: White wins' + formatReason(gameResult.reason)
  } else {
    return '0-1: Black wins' + formatReason((gameResult as Decisive).reason)
  }
}
