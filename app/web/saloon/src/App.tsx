import type { FC } from "react"
import { useEffect } from "react"

import * as AtomIO from "atom.io"
import { useO } from "atom.io/react"
import { AtomIODevtools } from "atom.io/react-devtools"
import { Link, Route } from "wouter"

import {
  createRoomTX,
  findPlayersInRoomState,
  joinRoomTX,
  leaveRoomTX,
  playersIndex,
  roomsIndex,
} from "~/app/node/lodge/src/store/rooms"
import { stringSetJsonInterface } from "~/packages/anvl/src/json"

import { SocketStatus } from "./components/SocketStatus"
import { Game } from "./Game"
import { socket } from "./services/socket"
import {
  socketIdState,
  useRemoteTransaction,
  useRemoteFamily,
  useRemoteState,
} from "./services/store"

export const App: FC = () => {
  // useEffect(() => {
  //   socket.on(`welcome`, AtomIO.__INTERNAL__.clearStore)
  //   return () => {
  //     socket.off(`welcome`, AtomIO.__INTERNAL__.clearStore)
  //   }
  // }, [])
  const players = useO(playersIndex)
  useRemoteState(playersIndex, stringSetJsonInterface)
  return (
    <>
      <SocketStatus />
      <header>
        <h1>Saloon</h1>
        {[...players].map((playerId) => (
          <div key={playerId}>{playerId}</div>
        ))}
      </header>
      <main>
        <Route path="/">
          <Lobby />
        </Route>
        <Route path="/room/:roomId">
          {(params) => <Room roomId={params.roomId} />}
        </Route>
        <AtomIODevtools />
      </main>
    </>
  )
}

export const Lobby: FC = () => {
  const roomIds = useO(roomsIndex)
  const runCreateRoom = useRemoteTransaction(createRoomTX)
  useRemoteState(roomsIndex, stringSetJsonInterface)
  return (
    <div>
      <h2>Lobby</h2>
      {[...roomIds].map((roomId) => (
        <Link key={roomId} href={`/room/${roomId}`}>
          {roomId}
        </Link>
      ))}
      <button onClick={() => runCreateRoom()}>Create Room</button>
    </div>
  )
}

export const Room: FC<{ roomId: string }> = ({ roomId }) => {
  const socketId = useO(socketIdState)
  const playersInRoom = useO(findPlayersInRoomState(roomId))
  const iAmInRoom = playersInRoom.some((player) => player.id === socketId)

  const joinRoom = useRemoteTransaction(joinRoomTX)
  const leaveRoom = useRemoteTransaction(leaveRoomTX)
  useRemoteFamily(findPlayersInRoomState, roomId, {
    fromJson: (json) => json,
    toJson: (value) => value,
  })

  return (
    <article className="room">
      <h2>Room # {roomId}</h2>
      <Link href="/">Back to Lobby</Link>
      <div>
        {playersInRoom.map((player) => (
          <div key={player.id}>
            {player.id}: {player.enteredAt}
          </div>
        ))}
      </div>

      <button
        onClick={() => joinRoom({ roomId, playerId: socketId ?? `` })}
        disabled={iAmInRoom}
      >
        Join Room
      </button>
      <button
        onClick={() => leaveRoom({ roomId, playerId: socketId ?? `` })}
        disabled={!iAmInRoom}
      >
        Leave Room
      </button>
      {iAmInRoom ? <Game /> : null}
    </article>
  )
}
