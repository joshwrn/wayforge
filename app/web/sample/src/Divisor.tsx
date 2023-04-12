import type { FC } from "react"

import { css } from "@emotion/react"

import { atom } from "~/packages/atom.io/src"

import { useStore } from "./services"

export const divisorState = atom<number>({
  key: `divisor`,
  default: 2,
})

export const Divisor: FC = () => {
  const [divisor, setDivisor] = useStore(divisorState)
  return (
    <div>
      <h1>Divisor: {divisor}</h1>
      <button
        onClick={() => setDivisor((divisor) => divisor + 1)}
        css={css`
          font-size: 2rem;
        `}
      >
        +
      </button>
      <button
        onClick={() => setDivisor((divisor) => divisor - 1)}
        css={css`
          font-size: 2rem;
        `}
      >
        -
      </button>
    </div>
  )
}
