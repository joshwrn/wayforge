import type { FC, ReactNode } from "react"

import { css } from "@emotion/react"

import { CARD_HEIGHT, CARD_PADDING, CARD_WIDTH } from "./Card"

export const Slot_PreviewCardSleeve: FC<{
  children: ReactNode
  hex: string
}> = ({ children, hex }) => (
  <slot
    css={css`
      background: #0f0;
      width: ${CARD_WIDTH + CARD_PADDING * 2}pt;
      height: ${CARD_HEIGHT + CARD_PADDING * 2}pt;
      display: block;
      position: relative;
      overflow: hidden;
      &:hover {
        .sleeve-bg {
          border-color: transparent;
        }
      }
      data {
        position: absolute;
        top: -0px;
        left: -0px;
      }
      .sleeve-bg {
        height: 100%;
        width: 100%;
        display: block;
        box-sizing: border-box;
        border: 12px solid ${hex};
        opacity: 0.95;
        position: absolute;
        top: 0px;
        left: 0px;
        pointer-events: none;
      }
    `}
  >
    {children}
    <span className="sleeve-bg" />
  </slot>
)
