#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import Screens from './components/Screens'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { exitFullscreen, enterFullscreen } from './utils'
import { configure } from './logger'
import { AppConfig } from './types'
import winston from 'winston'

const args: AppConfig = yargs(hideBin(process.argv)).options({
  isFullscreen: {
    alias: 'f',
    type: 'boolean',
    default: true
  },
  enableLogging: {
    alias: 'l',
    type: 'boolean',
    default: false
  },
  useMockedGames: {
    alias: 'm',
    type: 'boolean',
    default: false
  }
}).parseSync()

configure(args)

winston.info('Configuration: ', args)

if (args.isFullscreen) {
  enterFullscreen()
  const { waitUntilExit } = render(<Screens {...args} />)
  waitUntilExit().then(() => exitFullscreen())
} else {
  render(<Screens {...args} />)
}
