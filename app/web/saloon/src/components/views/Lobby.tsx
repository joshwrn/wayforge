import type { FC } from "react"

import { useO } from "atom.io/react"
import { Link } from "react-router-dom"

import {
  createRoomTX,
  roomsIndex,
  roomsIndexJSON,
} from "~/app/node/lodge/src/store/rooms"

import { useRemoteState, useRemoteTransaction } from "../../services/store"

export const Lobby: FC = () => {
  const roomIds = useO(roomsIndex)
  const runCreateRoom = useRemoteTransaction(createRoomTX)
  useRemoteState(roomsIndexJSON, {
    toJson: (v) => v,
    fromJson: (j) => j,
  })
  return (
    <div>
      <h2>Lobby</h2>
      {[...roomIds].map((roomId) => (
        <Link key={roomId} to={`/room/${roomId}`}>
          {roomId}
        </Link>
      ))}
      <button onClick={() => runCreateRoom()}>Create Room</button>
    </div>
  )
}
