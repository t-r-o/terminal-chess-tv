import { Box, useInput } from 'ink'
import React, { useEffect, useRef } from 'react'
import { startingFen } from '../chess'
import GameInfo, { LoadingGame } from './GameInfo'
import ChessBoard from './ChessBoard'
import open from 'open'
import tvLoop from '../tvLoop'
import { AppConfig, UIState } from '../types'
import winston from 'winston'

export type TVProps = Pick<AppConfig, 'useMockedGames'>

export default function TV (props: TVProps) {
  const [uiState, setUiState] = React.useState<UIState>()
  const isRunning = useRef(true)

  useInput((input) => {
    const id = uiState?.id
    if ((input === 'l' || input === 'L') && id !== undefined) {
      open(`https://lichess.org/${id}`)
    }
  })

  useEffect(() => {
    tvLoop(setUiState, () => isRunning.current, props.useMockedGames)
      .catch(e => winston.error('Error in TV loop', e))
    return () => {
      isRunning.current = false
    }
  }, [])

  return (
        <Box flexDirection='column' alignItems='center' justifyContent='center'>
            {uiState ? <ChessBoard lastMove={uiState.lastMove} fen={uiState.fen}/> : <ChessBoard fen={startingFen}/>}
            {uiState ? <GameInfo result={uiState.result} mover={uiState.mover} white={uiState.white} black={uiState.black}/> : <LoadingGame/>}
        </Box>
  )
}
