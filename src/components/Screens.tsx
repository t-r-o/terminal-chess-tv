import { Box, Newline, Text, useApp, useInput } from 'ink'
import React from 'react'
import SelectInput from 'ink-select-input'
import { Item } from 'ink-select-input/build/SelectInput'
import open from 'open'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'
import useStdoutDimensions from 'ink-use-stdout-dimensions'
import TV from './TV'
import { gradientColours, startGradientColour } from '../colours'
import { AppConfig } from '../types'

type Screen = 'Menu' | 'TV' | 'About'
const githubUrl = 'https://github.com/t-r-o'

export type ScreensProps = Pick<AppConfig, 'isFullscreen' | 'useMockedGames'>

export default function Screens (props: ScreensProps) {
  const [screen, setScreen] = React.useState<Screen>('Menu')

  const { exit } = useApp()
  useInput((_, key) => {
    if (key.escape) {
      if (screen === 'Menu') {
        exit()
      }
      setScreen('Menu')
    }
  })

  let width, height
  if (props.isFullscreen) {
    [width, height] = useStdoutDimensions()
  }

  return (<Box height={height} width={width} alignItems='center' justifyContent='center'>
        {screen === undefined || screen === 'Menu' ? <Menu setScreen={setScreen} /> : screen === 'About' ? <About /> : <TV useMockedGames={props.useMockedGames} />}
    </Box>)
}

type Selectable = Extract<'TV' | 'About', Screen> | 'Github'

function Menu (props: { setScreen: (s: Screen) => void }) {
  const handleSelect = (item: Item<Selectable>) => {
    if (item.value === 'Github') {
      open(githubUrl)
    } else {
      props.setScreen(item.value)
    }
  }

  const items: Array<Item<Selectable>> = [
    { label: 'About', value: 'About' },
    { label: 'Watch TV', value: 'TV' },
    { label: 'Github', value: 'Github' }
  ]

  return (
        <Box flexDirection='column' justifyContent='center' alignItems='center'>
            <Gradient colors={gradientColours}><BigText font='pallet' text='Chess TV'/></Gradient>
                <SelectInput items={items}
                onSelect={handleSelect}
                itemComponent={({ isSelected, label }) => {
                  if (isSelected) {
                    return <Gradient colors={gradientColours}><Text bold={true}>{label}</Text></Gradient>
                  }
                  return <Text>{label}</Text>
                }}
                indicatorComponent={({ isSelected }) => (
                    <Text color={startGradientColour}>{isSelected ? '❯ ' : '  '}</Text>
                )}
                />
        </Box>
  )
}

function About () {
  return (
        <Box flexDirection='column' justifyContent='center' alignItems='center'>
            <Box><Gradient colors={gradientColours}><Text bold={true} color='red'>About Chess TV</Text></Gradient></Box>
            <Text color={startGradientColour}>
            <Newline/>
            - Shows high-rated ongoing games from Lichess
            <Newline/>
            - Press ESC to go back
            <Newline/>
            - Press L to show the current game in Lichess
            <Newline/>
            - See Github for more details
            </Text>
        </Box>
  )
}
