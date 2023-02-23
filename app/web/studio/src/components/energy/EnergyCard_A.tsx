import { useId } from "react"
import type { FC } from "react"

import { css } from "@emotion/react"
import { useRecoilValue } from "recoil"

import { Luum } from "~/packages/Luum/src"

import { EnergyIcon } from "./EnergyIcon"
import { findEnergyState } from "../../services/energy"
import { Card, CARD_HEIGHT, CARD_PADDING, CARD_WIDTH, cssCard } from "../Card"

export const Data_EnergyCard_A: FC<{ energyId: string }> = ({ energyId }) => {
  const domId = useId()
  const energy = useRecoilValue(findEnergyState(energyId))

  const colorA = Luum.fromJSON(energy.colorA)
  const colorB = Luum.fromJSON(energy.colorB)

  return (
    <Card colorA={colorA} colorB={colorB}>
      <article
        css={css`
          display: flex;
          flex-flow: column;
          width: ${CARD_WIDTH + CARD_PADDING * 2}pt;
          height: ${CARD_HEIGHT + CARD_PADDING * 2}pt;
          header {
            font-size: 13.5pt;
            padding: 22pt;
            position: absolute;
            top: 0;
            left: 0;
          }
          main {
            flex-grow: 1;
            display: flex;
            flex-flow: column;
            padding-top: 9pt;
            padding-bottom: 40pt;
            > div {
              display: flex;
              flex-flow: row;
              width: 100%;
              height: 6pt;
              padding: 0 18pt;
              flex-grow: 1;
              font-size: 6pt;
              justify-content: flex-end;
              align-items: center;
              color: ${colorB.hex};
              ~ div {
                border-top: 1pt solid ${colorA.shade(8).hex};
              }
            }
          }
        `}
      >
        <header>
          <EnergyIcon energyId={energyId} size={36} />
        </header>
        <main>
          {Array(30)
            .fill(0)
            .map((_, i) => (
              <div key={domId + `bar` + i + 1}>{i + 1}</div>
            ))}
        </main>
      </article>
    </Card>
  )
}
