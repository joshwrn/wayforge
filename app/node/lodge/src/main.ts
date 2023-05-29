import * as AtomIO from "atom.io"
import dotenv from "dotenv"
import { pipe } from "fp-ts/function"
import type { Socket } from "socket.io"
import { Server as WebSocketServer } from "socket.io"

import type { JsonInterface } from "~/packages/anvl/src/json"
import { stringSetJsonInterface } from "~/packages/anvl/src/json"
import type { TransactionUpdate } from "~/packages/atom.io/src/internal"

import { logger } from "./logger"
import type { JoinRoom } from "./store/rooms"
import {
  createRoom,
  findPlayersInRoomState,
  joinRoom,
  leaveRoom,
  playersInRoomsState,
  playersIndex,
  roomsIndex,
} from "./store/rooms"

export const serve = <T>(
  socket: Socket,
  token: AtomIO.StateToken<T>,
  transform: JsonInterface<T>
): void => {
  // socket.emit(`set:${token.key}`, transform.toJson(AtomIO.getState(token)))
  socket.on(`sub:${token.key}`, () => {
    logger.info(socket.id, `sub:${token.key}`)
    socket.emit(`serve:${token.key}`, transform.toJson(AtomIO.getState(token)))
    const unsubscribeFromPlayersInRoom = AtomIO.subscribe(
      token,
      ({ newValue }) => {
        socket.emit(`serve:${token.key}`, transform.toJson(newValue))
      }
    )
    socket.on(`unsub:${token.key}`, () => {
      logger.info(socket.id, `unsub:${token.key}`)
      unsubscribeFromPlayersInRoom()
    })
  })
}

const serveFamily = <T>(
  socket: Socket,
  family: AtomIO.AtomFamily<T> | AtomIO.SelectorFamily<T>,
  transform: JsonInterface<T>
) => {
  socket.on(`sub:${family.key}`, (subKey: AtomIO.Serializable) => {
    logger.info(socket.id, `sub:${family.key}`, subKey)
    const token = family(subKey)
    socket.emit(`serve:${token.key}`, transform.toJson(AtomIO.getState(token)))
    const unsubscribe = AtomIO.subscribe(token, ({ newValue }) => {
      socket.emit(`serve:${token.key}`, transform.toJson(newValue))
    })
    socket.on(`unsub:${token.key}`, () => {
      logger.info(socket.id, `unsub:${token.key}`)
      unsubscribe()
    })
  })
}

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
      logger.info(socket.id, `connected`)
      io.emit(`connection`)
      AtomIO.setState(
        playersIndex,
        (playersIndex) => new Set([...playersIndex, socket.id])
      )

      serve(socket, roomsIndex, stringSetJsonInterface)
      serveFamily(socket, findPlayersInRoomState, {
        fromJson: (json) => json,
        toJson: (value) => value,
      })

      // create:room

      socket.on(`new:room`, (update: TransactionUpdate<() => string>) => {
        logger.info(socket.id, `new:room`, update.output)
        AtomIO.runTransaction(createRoom)(update.output)
      })

      // join:room

      socket.on(`join:room`, (update: TransactionUpdate<JoinRoom>) => {
        logger.info(socket.id, `join:room`, update)
        const { roomId, playerId } = update.params[0]
        if (playerId !== socket.id) {
          logger.error(socket.id, `tried to join:room as`, playerId)
          socket.disconnect()
        }

        AtomIO.runTransaction(joinRoom)(...update.params)

        socket.join(roomId)
        const unsubscribeFromPlayersInRoom = AtomIO.subscribe(
          findPlayersInRoomState(roomId),
          ({ newValue }) => {
            socket.emit(`set:playersInRoom:${roomId}`, [...newValue])
          }
        )

        socket.on(`leave:room`, () => {
          logger.info(socket.id, `leave:room`, roomId)
          AtomIO.runTransaction(leaveRoom)({ roomId, playerId: socket.id })
          socket.leave(roomId)
          unsubscribeFromPlayersInRoom()
        })
      })

      // disconnect

      socket.on(`disconnect`, () => {
        logger.info(socket.id, `disconnected`)
        AtomIO.setState(
          playersIndex,
          (playersIndex) =>
            new Set([...playersIndex].filter((id) => id !== socket.id))
        )
        AtomIO.setState(playersInRoomsState, (current) =>
          current.remove({ playerId: socket.id })
        )
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
