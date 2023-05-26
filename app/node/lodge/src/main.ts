import crypto from "node:crypto"

import dotenv from "dotenv"
import { pipe } from "fp-ts/function"
import type { Socket } from "socket.io"
import { Server as WebSocketServer } from "socket.io"

import { Join } from "~/packages/anvl/src/join"
import type {
  AtomToken,
  ReadonlySelectorToken,
  SelectorToken,
} from "~/packages/atom.io/src"
import {
  getState,
  runTransaction,
  setLogLevel,
  setState,
  subscribe,
} from "~/packages/atom.io/src"
import type { TransactionUpdate } from "~/packages/atom.io/src/internal"
import { attachMetaState } from "~/packages/atom.io/src/internal/meta/attach-meta"

import { logger } from "./logger"
import {
  createRoom,
  findPlayersInRoomState,
  joinRoom,
  playersInRoomsState,
  playersIndex,
  roomsIndex,
} from "./store/rooms"

// setLogLevel(`info`)

const { atomTokenIndexState, selectorTokenIndexState } = attachMetaState()

const emitState = <T>(
  socket: Socket,
  token: AtomToken<T> | ReadonlySelectorToken<T> | SelectorToken<T>
) => {
  const currentValue = getState(token)
  if (currentValue instanceof Set) {
    socket.emit(`atom`, token, [...currentValue])
  } else if (currentValue instanceof Join) {
    socket.emit(`atom`, token, currentValue.toJSON())
  } else {
    socket.emit(`atom`, token, currentValue)
  }
}

subscribe(playersInRoomsState, ({ newValue, oldValue }) => {
  logger.info(`playersInRoomsState`, `oldValue`, oldValue.toJSON().relations)
  logger.info(`playersInRoomsState`, `newValue`, newValue.toJSON().relations)
})

dotenv.config()
pipe(
  new WebSocketServer(3333, {
    cors: {
      origin: `http://localhost:5173`,
      methods: [`GET`, `POST`],
    },
  }),
  (io) => {
    io.on(`connection`, (socket) => {
      socket.emit(`set:roomsIndex`, [...getState(roomsIndex)])
      logger.info(socket.id, `connected`)
      io.emit(`connection`)
      setState(playersIndex, (current) => {
        const next = new Set([...current, socket.id])
        logger.info(socket.id, `set:playersIndex`, { current, next })
        return next
      })
      const unsubRoomsIndex = subscribe(roomsIndex, ({ newValue }) => {
        socket.emit(`set:roomsIndex`, [...newValue])
      })
      socket.on(`new:room`, (update: TransactionUpdate<() => string>) => {
        logger.info(socket.id, `new:room`, update.output)
        runTransaction(createRoom)(update.output)
      })
      socket.on(`get:playersInRoom`, (roomId: string) => {
        logger.info(socket.id, `get:playersInRoom`, roomId)
        socket.emit(`set:playersInRoom:${roomId}`, [
          ...getState(findPlayersInRoomState(roomId)),
        ])
      })

      socket.on(`sub:playersInRoom`, (roomId: string) => {
        logger.info(socket.id, `sub:playersInRoom`, roomId)
        socket.emit(`set:playersInRoom:${roomId}`, [
          ...getState(findPlayersInRoomState(roomId)),
        ])
        const unsubscribeFromPlayersInRoom = subscribe(
          findPlayersInRoomState(roomId),
          ({ newValue }) => {
            socket.emit(`set:playersInRoom:${roomId}`, [...newValue])
          }
        )
        socket.on(`unsub:playersInRoom`, () => {
          logger.info(socket.id, `unsub:playersInRoom`, roomId)
          unsubscribeFromPlayersInRoom()
        })
      })

      // join:room

      socket.on(
        `join:room`,
        (
          update: TransactionUpdate<(roomId: string, socketId: string) => void>
        ) => {
          const [roomId, playerId] = update.params
          logger.info(socket.id, `join:room`, roomId)
          if (playerId !== socket.id) {
            logger.error(
              socket.id,
              `join:room`,
              `playerId`,
              playerId,
              `does not match socket.id`
            )
          }
          runTransaction(joinRoom)(...update.params)
          socket.emit(`set:playersInRoom:${roomId}`, [
            ...getState(findPlayersInRoomState(roomId)),
          ])
          socket.join(roomId)
          const unsubscribeFromPlayersInRoom = subscribe(
            findPlayersInRoomState(roomId),
            ({ newValue }) => {
              socket.emit(`set:playersInRoom:${roomId}`, [...newValue])
            }
          )
          socket.on(`leave:room`, () => {
            logger.info(socket.id, `leave:room`, roomId)
            socket.leave(roomId)
            unsubscribeFromPlayersInRoom()
          })
        }
      )

      // disconnect

      socket.on(`disconnect`, () => {
        logger.info(socket.id, `disconnected`)
        setState(
          playersIndex,
          (playersIndex) =>
            new Set([...playersIndex].filter((id) => id !== socket.id))
        )
        setState(playersInRoomsState, (current) => current.remove(socket.id))
      })

      // admin
      socket.on(`auth:admin`, (password: string) => {
        const salt = `811704560339545`
        const hash = crypto.createHash(`sha256`)
        hash.update(`${salt}${password}`)
        const hashedPassword = hash.digest(`hex`)
        logger.info(socket.id, `auth:admin`, hashedPassword)
        if (
          hashedPassword ===
          `03ab11e7e41fefae9ca637f5e7cabbe946e6e6705c662e14902b8ef38c996f71`
        ) {
          logger.info(socket.id, `auth:admin`, `success`)
          socket.emit(`auth:admin`, `success`)
          const tokensAndFamilies = getState(atomTokenIndexState)
          for (const tokenOrFamily of Object.values(tokensAndFamilies)) {
            if (`familyMembers` in tokenOrFamily) {
              for (const token of Object.values(tokenOrFamily.familyMembers)) {
                emitState(socket, token)
                subscribe(token, () => emitState(socket, token))
              }
            } else {
              emitState(socket, tokenOrFamily)
              subscribe(tokenOrFamily, () => emitState(socket, tokenOrFamily))
            }
          }
          subscribe(atomTokenIndexState, ({ newValue }) => {
            socket.emit(`set:atomTokenIndex`, newValue)
          })
        }
      })
    })
  }
)

logger.info(
  `   `,
  `|¯\\_________________________________|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\\_|`
)
logger.info(``, ``)

logger.info(
  `[/]`,
  `|__________________________/ `,
  `▓▓   ▓▓   ▓▓`,
  ` \\___________________________|`
)
logger.info(`[/]`, `                             `, `▓▓   ▓▓   ▓▓`)
logger.info(
  `[/]`,
  `  00                         `,
  `▓▓   ▓▓   ▓▓`,
  `              WAYFORGE : LODGE`
)
logger.info(`[/]`, `                             `, `▓▓        ▓▓`)
logger.info(
  `[/]`,
  `|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯\\ `,
  `▓▓▓▓▓▓▓▓▓▓▓▓`,
  ` /¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|`
)
logger.info(``, ``)
logger.info(
  `   `,
  `|_/¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|_________________________________/¯|`
)
