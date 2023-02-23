import type { FC } from "react"
import { useId, useRef } from "react"

import { css } from "@emotion/react"
import html2pdf from "html2pdf.js"
import { useRecoilValue } from "recoil"

import type { WC } from "~/packages/hamr/src/react-json-editor"
import { Repeater } from "~/packages/hamr/src/react-repeater"

import { energyIndex } from "../../services/energy"
import { useSetTitle } from "../../services/view"
import { Data_EnergyCard_A } from "../energy/EnergyCard_A"
import { Data_EnergyCard_B } from "../energy/EnergyCard_B"

const worker = html2pdf().set({
  margin: 0,
  filename: `cards.pdf`,
  image: { type: `png` },
  html2canvas: { scale: 3 },
  jsPDF: { unit: `in`, format: `letter`, orientation: `landscape` },
})
export const Page: WC = ({ children }) => {
  const domId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const savePage = () => worker.from(ref.current).save()
  return (
    <>
      <section
        ref={ref}
        css={css`
          height: 612pt;
          width: 792pt;
          padding: 24pt;
          background: white;
          flex-shrink: 0;
          flex-flow: column;
        `}
      >
        {children}
      </section>
      <button onClick={savePage}>save</button>
    </>
  )
}

export const CardPrint: FC = () => {
  const energyIds = useRecoilValue(energyIndex)
  console.log({ energyIds })

  return (
    <div
      css={css`
        display: flex;
        flex-flow: row wrap;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
      `}
    >
      <Repeater count={8}>
        <Data_EnergyCard_B energyId={[...energyIds][0]} />
      </Repeater>
    </div>
  )
}

export const PrintHome: FC = () => {
  useSetTitle(`Print`)

  return (
    <Page>
      <CardPrint />
    </Page>
  )
}
