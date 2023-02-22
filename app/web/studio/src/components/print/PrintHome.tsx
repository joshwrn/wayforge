import type { FC } from "react"
import { useId, useRef } from "react"

import { css } from "@emotion/react"
import html2pdf from "html2pdf.js"
import { useRecoilValue } from "recoil"

import type { WC } from "~/packages/hamr/src/react-json-editor"

import { energyIndex } from "../../services/energy"
import { useSetTitle } from "../../services/view"
import { Data_EnergyCard_A } from "../energy/EnergyCard_A"

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
          padding: 36pt;
          background: white;
          flex-shrink: 0;
          flex-flow: column;
          marks {
            /* display: flex; */
            display: block;
            height: 10pt;
            width: 100%;
            /* justify-content: space-between; */
            div {
              background: black;
              width: 1pt;
              ~ div {
                margin-left: 72pt;
              }
            }
          }
        `}
      >
        <marks is="div">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div key={domId + `bar` + i + 1} />
            ))}
        </marks>
        {children}
      </section>
      <button onClick={savePage}>save</button>
    </>
  )
}

export const PrintHome: FC = () => {
  useSetTitle(`Print`)

  const energyIds = useRecoilValue(energyIndex)
  console.log({ energyIds })
  return (
    <>
      <Page>
        <Data_EnergyCard_A energyId={[...energyIds][4]} />
      </Page>
      <Data_EnergyCard_A energyId={[...energyIds][4]} />
    </>
  )
}
