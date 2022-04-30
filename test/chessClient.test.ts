import { timeUsedPercent, convertToSeconds, LichessGame, parseTimeRemaining, chooseGame, getGame, MockClient } from '../src/chessClient'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

test('parseTimeRemaining', () => {
  expect(parseTimeRemaining(' [%clk 0:02:59] ')).toEqual(179)
  expect(parseTimeRemaining(' [%eval 0.24] [%clk 0:00:14] ')).toEqual(14)
  try {
    parseTimeRemaining(' [%cl 0:02:54] ')
    fail('Expected error')
  } catch (e) {
    expect(e).toBeInstanceOf(Error)
  }
})

test('convertToSeconds', () => {
  expect(convertToSeconds('01:40')).toEqual(100)
  expect(convertToSeconds('21:43')).toEqual(1303)
})

test('timeUsedPercent', () => {
  const game: Partial<LichessGame> = {
    clock: {
      increment: 0,
      initial: 180,
      totalTime: 180
    },
    pgn: '[Event "Rated Blitz game"]\n[Site "https://lichess.org/QQnas7UX"]\n[Date "2022.04.14"]\n[White "JuneInLima"]\n[Black "Thunder-In-Paradise"]\n[Result "*"]\n[UTCDate "2022.04.14"]\n[UTCTime "16:05:10"]\n[WhiteElo "2570"]\n[BlackElo "2638"]\n[BlackTitle "NM"]\n[Variant "Standard"]\n[TimeControl "180+0"]\n[ECO "C84"]\n[Termination "Unterminated"]\n\n1. e4 { [%clk 0:03:00] } 1... e5 { [%clk 0:03:00] } 2. Nf3 { [%clk 0:02:59] } 2... Nc6 { [%clk 0:02:59] } 3. Bb5 { [%clk 0:02:58] } 3... a6 { [%clk 0:02:59] } 4. Ba4 { [%clk 0:02:57] } 4... Nf6 { [%clk 0:02:58] } 5. O-O { [%clk 0:02:55] } 5... Be7 { [%clk 0:02:56] } 6. d3 { [%clk 0:02:54] } 6... d6 { [%clk 0:02:51] } 7. Nc3 { [%clk 0:02:51] } 7... h6 { [%clk 0:02:48] } 8. h3 { [%clk 0:02:48] } 8... O-O { [%clk 0:02:46] } 9. Re1 { [%clk 0:02:45] } 9... Re8 { [%clk 0:02:36] } 10. a3 { [%clk 0:02:44] } 10... Bf8 { [%clk 0:02:35] } 11. Nd5 { [%clk 0:02:39] } 11... Bd7 { [%clk 0:02:28] } 12. b4 { [%clk 0:02:35] } 12... Nxd5 { [%clk 0:02:25] } 13. exd5 { [%clk 0:02:35] } 13... Ne7 { [%clk 0:02:24] } 14. Bb3 { [%clk 0:02:34] } 14... Ng6 { [%clk 0:02:20] } 15. c4 { [%clk 0:02:32] } 15... Be7 { [%clk 0:02:16] } 16. Bc2 { [%clk 0:02:13] } 16... f5 { [%clk 0:02:12] } 17. Rb1 { [%clk 0:02:10] } 17... a5 { [%clk 0:02:01] } 18. Bb2 { [%clk 0:01:54] } 18... Bf6 { [%clk 0:01:43] } *\n\n\n'
  }

  expect(timeUsedPercent(game as LichessGame)).toEqual(39)
})

test('chooseGame', () => {
  try {
    chooseGame([])
    fail('Should throw error')
  } catch (e) {
    expect(e).toBeInstanceOf(Error)
  }

  const game1: Partial<LichessGame> = {
    id: 'game1',
    status: 'started',
    pgn: "[Event \"Rated Blitz game\"]\n[Site \"https://lichess.org/V5jCmnTh\"]\n[Date \"2022.04.21\"]\n[White \"Violet_Pride\"]\n[Black \"winx_m\"]\n[Result \"*\"]\n[UTCDate \"2022.04.21\"]\n[UTCTime \"16:10:07\"]\n[WhiteElo \"2829\"]\n[BlackElo \"2933\"]\n[Variant \"Standard\"]\n[TimeControl \"180+0\"]\n[ECO \"E60\"]\n[Opening \"King's Indian Defense: Normal Variation, King's Knight Variation\"]\n[Termination \"Unterminated\"]\n\n1. d4 { [%clk 0:03:00] } 1... Nf6 { [%clk 0:03:00] } 2. Nf3 { [%clk 0:02:59] } 2... g6 { [%clk 0:03:00] } 3. c4 { [%clk 0:02:58] } *\n\n\n",
    clock: {
      initial: 180,
      increment: 0,
      totalTime: 180
    }
  }
  const game2: Partial<LichessGame> = {
    id: 'game2',
    status: 'started',
    pgn: '[Event "Rated Blitz game"]\n[Site "https://lichess.org/YoJIjXQn"]\n[Date "2022.04.21"]\n[White "JohnnyAnto"]\n[Black "Soul_Pug"]\n[Result "*"]\n[UTCDate "2022.04.21"]\n[UTCTime "16:10:03"]\n[WhiteElo "2523"]\n[BlackElo "2522"]\n[WhiteTitle "CM"]\n[Variant "Standard"]\n[TimeControl "180+0"]\n[ECO "C42"]\n[Opening "Russian Game: Nimzowitsch Attack"]\n[Termination "Unterminated"]\n\n1. e4 { [%clk 0:03:00] } 1... e5 { [%clk 0:03:00] } 2. Nf3 { [%clk 0:02:59] } 2... Nf6 { [%clk 0:02:59] } 3. Nxe5 { [%clk 0:02:58] } 3... d6 { [%clk 0:02:59] } 4. Nf3 { [%clk 0:02:58] } 4... Nxe4 { [%clk 0:02:58] } 5. Nc3 { [%clk 0:02:57] } 5... Nxc3 { [%clk 0:02:58] } 6. dxc3 { [%clk 0:02:57] } 6... Be7 { [%clk 0:02:57] } 7. Bd3 { [%clk 0:02:56] } *\n\n\n',
    clock: {
      initial: 180,
      increment: 0,
      totalTime: 180
    }
  }
  const games = [game1, game2]
  const chosen = chooseGame(games as LichessGame[])
  expect(chosen.id).toEqual('game2')

  const game3: Partial<LichessGame> = {
    id: 'game3',
    status: 'resign',
    pgn: "[Event \"Rated Blitz game\"]\n[Site \"https://lichess.org/V5jCmnTh\"]\n[Date \"2022.04.21\"]\n[White \"Violet_Pride\"]\n[Black \"winx_m\"]\n[Result \"*\"]\n[UTCDate \"2022.04.21\"]\n[UTCTime \"16:10:07\"]\n[WhiteElo \"2829\"]\n[BlackElo \"2933\"]\n[Variant \"Standard\"]\n[TimeControl \"180+0\"]\n[ECO \"E60\"]\n[Opening \"King's Indian Defense: Normal Variation, King's Knight Variation\"]\n[Termination \"Unterminated\"]\n\n1. d4 { [%clk 0:03:00] } 1... Nf6 { [%clk 0:03:00] } 2. Nf3 { [%clk 0:02:59] } 2... g6 { [%clk 0:03:00] } 3. c4 { [%clk 0:02:58] } *\n\n\n",
    clock: {
      initial: 180,
      increment: 0,
      totalTime: 180
    }
  }
  const game4: Partial<LichessGame> = {
    id: 'game4',
    status: 'started',
    pgn: '[Event "Rated Blitz game"]\n[Site "https://lichess.org/YoJIjXQn"]\n[Date "2022.04.21"]\n[White "JohnnyAnto"]\n[Black "Soul_Pug"]\n[Result "*"]\n[UTCDate "2022.04.21"]\n[UTCTime "16:10:03"]\n[WhiteElo "2523"]\n[BlackElo "2522"]\n[WhiteTitle "CM"]\n[Variant "Standard"]\n[TimeControl "180+0"]\n[ECO "C42"]\n[Opening "Russian Game: Nimzowitsch Attack"]\n[Termination "Unterminated"]\n\n1. e4 { [%clk 0:03:00] } 1... e5 { [%clk 0:03:00] } 2. Nf3 { [%clk 0:02:59] } 2... Nf6 { [%clk 0:02:59] } 3. Nxe5 { [%clk 0:02:58] } 3... d6 { [%clk 0:02:59] } 4. Nf3 { [%clk 0:02:58] } 4... Nxe4 { [%clk 0:02:58] } 5. Nc3 { [%clk 0:02:57] } 5... Nxc3 { [%clk 0:02:58] } 6. dxc3 { [%clk 0:02:57] } 6... Be7 { [%clk 0:02:57] } 7. Bd3 { [%clk 0:02:56] } *\n\n\n',
    clock: {
      initial: 180,
      increment: 0,
      totalTime: 180
    }
  }
  const chosen1 = chooseGame([game3, game4] as LichessGame[])
  expect(chosen1.id).toEqual('game3')
})

test('getGame', async () => {
  const mocked = new MockAdapter(axios)
  const response = [
    { id: 'zOBj1ErG', rated: true, variant: 'standard', speed: 'blitz', perf: 'blitz', createdAt: 1650724517660, lastMoveAt: 1650724541483, status: 'started', players: { white: { user: { name: 'NoRolex', id: 'norolex' }, rating: 2836 }, black: { user: { name: 'Pigmanbear', id: 'pigmanbear' }, rating: 2850 } }, moves: 'e4 c5 Nf3 d6 Bb5+ Nd7 c3 Nf6 Qe2 a6 Bd3 b5 Bc2 Bb7 d4 e6 O-O Be7 e5 dxe5 dxe5 Nd5 Nbd2 Qc7 Re1', pgn: '[Event "Rated Blitz game"]\n[Site "https://lichess.org/zOBj1ErG"]\n[Date "2022.04.23"]\n[White "NoRolex"]\n[Black "Pigmanbear"]\n[Result "*"]\n[UTCDate "2022.04.23"]\n[UTCTime "14:35:17"]\n[WhiteElo "2836"]\n[BlackElo "2850"]\n[Variant "Standard"]\n[TimeControl "180+0"]\n[ECO "B51"]\n[Termination "Unterminated"]\n\n1. e4 { [%clk 0:03:00] } 1... c5 { [%clk 0:03:00] } 2. Nf3 { [%clk 0:03:00] } 2... d6 { [%clk 0:02:59] } 3. Bb5+ { [%clk 0:02:59] } 3... Nd7 { [%clk 0:02:58] } 4. c3 { [%clk 0:02:59] } 4... Nf6 { [%clk 0:02:56] } 5. Qe2 { [%clk 0:02:58] } 5... a6 { [%clk 0:02:53] } 6. Bd3 { [%clk 0:02:58] } 6... b5 { [%clk 0:02:52] } 7. Bc2 { [%clk 0:02:57] } 7... Bb7 { [%clk 0:02:51] } 8. d4 { [%clk 0:02:57] } 8... e6 { [%clk 0:02:50] } 9. O-O { [%clk 0:02:56] } 9... Be7 { [%clk 0:02:49] } 10. e5 { [%clk 0:02:56] } 10... dxe5 { [%clk 0:02:48] } 11. dxe5 { [%clk 0:02:56] } 11... Nd5 { [%clk 0:02:47] } 12. Nbd2 { [%clk 0:02:56] } 12... Qc7 { [%clk 0:02:46] } 13. Re1 { [%clk 0:02:55] } *\n\n\n', clock: { initial: 180, increment: 0, totalTime: 180 } },
    { id: '5eyohXQi', rated: true, variant: 'standard', speed: 'blitz', perf: 'blitz', createdAt: 1650724480437, lastMoveAt: 1650724539405, status: 'started', players: { white: { user: { name: 'Avenger82', title: 'FM', id: 'avenger82' }, rating: 2898 }, black: { user: { name: 'EleKtRoMaGnIt', title: 'FM', id: 'elektromagnit' }, rating: 2905 } }, moves: 'e4 c6 Nc3 d5 Qe2 d4 Nd1 e5 d3 Bb4+ c3 dxc3 bxc3 Ba5 Nf3 Bg4 h3 Bxf3 Qxf3 Nf6 Be2 O-O O-O Nbd7 a4 Re8 Rb1 Rb8 Be3 Bb6', pgn: '[Event "Rated Blitz game"]\n[Site "https://lichess.org/5eyohXQi"]\n[Date "2022.04.23"]\n[White "Avenger82"]\n[Black "EleKtRoMaGnIt"]\n[Result "*"]\n[UTCDate "2022.04.23"]\n[UTCTime "14:34:40"]\n[WhiteElo "2898"]\n[BlackElo "2905"]\n[WhiteTitle "FM"]\n[BlackTitle "FM"]\n[Variant "Standard"]\n[TimeControl "180+0"]\n[ECO "B10"]\n[Termination "Unterminated"]\n\n1. e4 { [%clk 0:03:00] } 1... c6 { [%clk 0:03:00] } 2. Nc3 { [%clk 0:02:54] } 2... d5 { [%clk 0:03:00] } 3. Qe2 { [%clk 0:02:53] } 3... d4 { [%clk 0:02:58] } 4. Nd1 { [%clk 0:02:53] } 4... e5 { [%clk 0:02:58] } 5. d3 { [%clk 0:02:51] } 5... Bb4+ { [%clk 0:02:56] } 6. c3 { [%clk 0:02:50] } 6... dxc3 { [%clk 0:02:55] } 7. bxc3 { [%clk 0:02:50] } 7... Ba5 { [%clk 0:02:55] } 8. Nf3 { [%clk 0:02:47] } 8... Bg4 { [%clk 0:02:54] } 9. h3 { [%clk 0:02:46] } 9... Bxf3 { [%clk 0:02:53] } 10. Qxf3 { [%clk 0:02:44] } 10... Nf6 { [%clk 0:02:52] } 11. Be2 { [%clk 0:02:44] } 11... O-O { [%clk 0:02:51] } 12. O-O { [%clk 0:02:43] } 12... Nbd7 { [%clk 0:02:50] } 13. a4 { [%clk 0:02:43] } 13... Re8 { [%clk 0:02:46] } 14. Rb1 { [%clk 0:02:39] } 14... Rb8 { [%clk 0:02:38] } 15. Be3 { [%clk 0:02:37] } 15... Bb6 { [%clk 0:02:30] } *\n\n\n', clock: { initial: 180, increment: 0, totalTime: 180 } },
    { id: 'hENkBmqV', rated: true, variant: 'standard', speed: 'blitz', perf: 'blitz', createdAt: 1650724365787, lastMoveAt: 1650724531774, status: 'started', players: { white: { user: { name: 'AdrianPetrisor92', title: 'IM', id: 'adrianpetrisor92' }, rating: 2689 }, black: { user: { name: 'promacherrr', id: 'promacherrr' }, rating: 2755 } }, moves: 'e4 c6 d4 d5 e5 Bf5 h4 h5 Bd3 Bxd3 Qxd3 e6 Bg5 Qb6 Nd2 Qa6 c4 Nd7 Ngf3 Nh6 O-O Nf5 Rfc1 Bb4 a3 Bxd2 Nxd2 O-O Nf3 Rac8 b4 dxc4 Qe4 Qb5 g4 hxg4 Qxg4 Qd5 Bf6 Nxf6 exf6 g6 Re1 Rfd8 Re5 Qd6 h5', pgn: '[Event "Rated Blitz game"]\n[Site "https://lichess.org/hENkBmqV"]\n[Date "2022.04.23"]\n[White "AdrianPetrisor92"]\n[Black "promacherrr"]\n[Result "*"]\n[UTCDate "2022.04.23"]\n[UTCTime "14:32:45"]\n[WhiteElo "2689"]\n[BlackElo "2755"]\n[WhiteTitle "IM"]\n[Variant "Standard"]\n[TimeControl "180+0"]\n[ECO "B12"]\n[Termination "Unterminated"]\n\n1. e4 { [%clk 0:03:00] } 1... c6 { [%clk 0:03:00] } 2. d4 { [%clk 0:02:59] } 2... d5 { [%clk 0:03:00] } 3. e5 { [%clk 0:02:58] } 3... Bf5 { [%clk 0:02:59] } 4. h4 { [%clk 0:02:57] } 4... h5 { [%clk 0:02:58] } 5. Bd3 { [%clk 0:02:57] } 5... Bxd3 { [%clk 0:02:57] } 6. Qxd3 { [%clk 0:02:57] } 6... e6 { [%clk 0:02:57] } 7. Bg5 { [%clk 0:02:55] } 7... Qb6 { [%clk 0:02:56] } 8. Nd2 { [%clk 0:02:54] } 8... Qa6 { [%clk 0:02:56] } 9. c4 { [%clk 0:02:53] } 9... Nd7 { [%clk 0:02:55] } 10. Ngf3 { [%clk 0:02:52] } 10... Nh6 { [%clk 0:02:54] } 11. O-O { [%clk 0:02:51] } 11... Nf5 { [%clk 0:02:54] } 12. Rfc1 { [%clk 0:02:50] } 12... Bb4 { [%clk 0:02:50] } 13. a3 { [%clk 0:02:45] } 13... Bxd2 { [%clk 0:02:49] } 14. Nxd2 { [%clk 0:02:38] } 14... O-O { [%clk 0:02:47] } 15. Nf3 { [%clk 0:02:35] } 15... Rac8 { [%clk 0:02:46] } 16. b4 { [%clk 0:02:31] } 16... dxc4 { [%clk 0:02:44] } 17. Qe4 { [%clk 0:02:30] } 17... Qb5 { [%clk 0:02:25] } 18. g4 { [%clk 0:02:28] } 18... hxg4 { [%clk 0:02:25] } 19. Qxg4 { [%clk 0:02:28] } 19... Qd5 { [%clk 0:02:24] } 20. Bf6 { [%clk 0:02:27] } 20... Nxf6 { [%clk 0:01:59] } 21. exf6 { [%clk 0:02:26] } 21... g6 { [%clk 0:01:59] } 22. Re1 { [%clk 0:02:04] } 22... Rfd8 { [%clk 0:01:46] } 23. Re5 { [%clk 0:01:59] } 23... Qd6 { [%clk 0:01:43] } 24. h5 { [%clk 0:01:55] } *\n\n\n', clock: { initial: 180, increment: 0, totalTime: 180 } }
  ]

  mocked.onGet('https://lichess.org/api/tv/blitz').reply(200, response.map(x => JSON.stringify(x)).join('\n') + '\n')

  const result = await getGame()

  expect(result.id).toEqual('hENkBmqV')
})

test('mockClient', async () => {
  const mockClient = new MockClient()
  const game1 = await mockClient.getGame()
  console.log(game1.black)
  console.log(game1.moves[0])
  const game2 = await mockClient.getGame()
  expect(game1).not.toEqual(game2)
  const game3 = await mockClient.getGame()
  expect(game1).toEqual(game3)
})
