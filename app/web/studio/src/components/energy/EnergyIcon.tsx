import type { FC } from "react"
import { useId } from "react"

import { css } from "@emotion/react"
import { useNavigate } from "react-router-dom"
import { useRecoilValue } from "recoil"

import type { RecoilListItemProps } from "~/packages/hamr/src/recoil-tools/RecoilList"
import { Luum } from "~/packages/Luum/src"

import type { Energy } from "../../services/energy"
import { findEnergyState } from "../../services/energy"
import type { Amount } from "../../services/energy_reaction"

export const SvgTSpan_Spacer: FC = () => (
  <tspan fill="none" stroke="none" style={{ userSelect: `none` }}>{`-`}</tspan>
)
export const Spacer: FC = () => (
  <span style={{ userSelect: `none`, color: `none` }}>{`-`}</span>
)

export const EnergyIcon_INTERNAL: FC<{
  energy: Energy
  size: number
  clickable?: boolean
}> = ({ energy, size, clickable = true }) => {
  const domId = useId()
  const middle = size / 2
  const colorA = Luum.fromJSON(energy.colorA)
  const colorB = Luum.fromJSON(energy.colorB)
  const navigate = useNavigate()

  return (
    <div
      css={css`
        width: ${size}px;
        height: ${size}px;
        display: flex;
        flex-grow: 0;
        cursor: ${clickable ? `pointer` : `default`};
        b,
        i {
          font-family: Uruz;
          white-space: nowrap;
        }
        b {
          width: 100%;
          height: 100%;
          /* clip-path: circle(${size / 2}px at center); */
          position: relative;
          top: 0;
          left: 0;
          pointer-events: none;
          border: 1px #0f0 solid;
        }
        i {
          font-style: normal;
        }
      `}
      onClick={clickable ? () => navigate(`/energy/${energy.id}`) : undefined}
    >
      <b>
        <span>_Meat</span>
      </b>
      <i>
        <span
          css={css`
            color: ${colorA.hex};
          `}
        >
          _{energy.name}
        </span>
      </i>
    </div>
  )
}

export const EnergyIcon: FC<{
  energyId: string
  size: number
  clickable?: boolean
}> = ({ energyId, size, clickable = true }) => {
  const energy = useRecoilValue(findEnergyState(energyId))
  return (
    <EnergyIcon_INTERNAL energy={energy} size={size} clickable={clickable} />
  )
}

export const VOID: Energy = {
  id: `MEAT`,
  icon: ``,
  name: `Meat`,
  colorA: {
    hue: 0,
    sat: 0,
    lum: 0.8,
    prefer: `lum`,
  },
  colorB: {
    hue: 0,
    sat: 0,
    lum: 0,
    prefer: `lum`,
  },
}

export const SVG_VoidIcon: FC<{
  size: number
  colorA: Luum
  colorB: Luum
}> = ({ size, colorA, colorB }) => (
  <EnergyIcon_INTERNAL energy={{ ...VOID, colorA, colorB }} size={size} />
)

export const Span_VoidIcon: FC<{
  size: number
  colorA: Luum
  colorB: Luum
}> = ({ size, colorA, colorB }) => (
  <span
    css={css`
      display: inline-flex;
      align-items: center;
    `}
  >
    <SVG_VoidIcon size={size} colorA={colorA} colorB={colorB} />
  </span>
)

export const EnergyAmountTag: FC<{
  energyId: string
  amount: number
  size: number
  clickable?: boolean
}> = ({ energyId, amount, size, clickable = true }) => {
  const small = size * 0.6
  return (
    <span
      css={css`
        display: inline-flex;
        align-items: bottom;
        justify-content: baseline;
      `}
    >
      <EnergyIcon energyId={energyId} size={size} clickable={clickable} />
      <span
        css={css`
          background-color: black;
          color: white;
          border: 0px solid white;
          padding: 1px;
          font-weight: 600;
          min-width: ${small}px;
          font-size: ${small}px;
          line-height: ${small * 0.8}px;
          height: ${small}px;
          text-align: center;
          align-items: center;
          justify-content: center;
          margin-left: ${small * -0.2}px;
        `}
      >
        {amount}
      </span>
    </span>
  )
}

export const Span_EnergyAmount: FC<
  RecoilListItemProps<Energy, Amount> & { size: number; clickable?: boolean }
> = ({ label, findState, size, clickable = true }) => {
  const { id, amount } = label
  const energy = useRecoilValue(findState(id))
  const domId = useId()
  return (
    <span
      css={css`
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        gap: 1px;
      `}
    >
      {amount <= 3 ? (
        Array(amount)
          .fill(null)
          .map((_, i) => (
            <EnergyIcon
              key={domId + `-icon-` + i}
              energyId={id}
              size={size}
              clickable={clickable}
            />
          ))
      ) : (
        <EnergyAmountTag
          energyId={energy.id}
          amount={amount}
          size={size}
          clickable={clickable}
        />
      )}
    </span>
  )
}
