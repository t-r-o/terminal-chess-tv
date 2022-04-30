import winston, { transport } from 'winston'
import { Console, File } from 'winston/lib/winston/transports'
import { AppConfig } from './types'

/**
 * Configures the global logger
 */
export function configure (config: AppConfig): void {
  const silentConsole = new Console({ silent: true })
  silentConsole.silent = true
  // Avoids error messages and supresses creation of files/folders by File transport
  const transports: transport[] = [
    silentConsole
  ]
  if (config.enableLogging) {
    const fileTransport = new File({
      filename: './logs/log.log',
      maxsize: 5 * 5 ** 20,
      maxFiles: 1,
      level: 'debug'
    })
    transports.push(fileTransport)
  }
  winston.configure({
    transports
  })
}
