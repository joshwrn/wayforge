import type { Socket } from "socket.io-client"

import type { GitClientEvents, GitServerEvents } from "./interface"

export type GitClientSocket = Socket<GitServerEvents, GitClientEvents>
