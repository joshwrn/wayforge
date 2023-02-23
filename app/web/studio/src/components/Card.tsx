import type { FC, ReactNode } from "react"

import type { SerializedStyles } from "@emotion/react"
import { css } from "@emotion/react"
import corners, { chamfer } from "corners"

import type { Luum } from "~/packages/Luum/src"

export const CARD_WIDTH = 180
export const CARD_HEIGHT = 252
export const CARD_PADDING = 3

export const cssCard = (colorA: Luum, _: Luum): SerializedStyles => css`
  background: ${colorA.hex};
  font-family: "Uruz";
  font-size: 10.8pt;
  width: ${CARD_WIDTH + CARD_PADDING * 2}pt;
  height: ${CARD_HEIGHT + CARD_PADDING * 2}pt;
  position: relative;
`
export const Card: FC<{ colorA: Luum; colorB: Luum; children: ReactNode }> = ({
  colorA,
  colorB,
  children,
}) => <div css={cssCard(colorA, colorB)}>{children}</div>

export const rightSlant = corners(null, chamfer)
