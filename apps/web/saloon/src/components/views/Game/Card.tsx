import { useO } from "atom.io/react"
import { AnimatePresence, motion } from "framer-motion"
import type { FC } from "react"

import { valuesOfCardsState } from "~/apps/node/lodge/src/store/game"

import scss from "./Card.module.scss"
import { PlayingCards } from "../../PlayingCards"

export const CardFace: FC<{ id: string }> = ({ id }) => {
	const value = useO(valuesOfCardsState).getRelatedId(id)
	const PlayingCard = PlayingCards[value as keyof typeof PlayingCards]
	return (
		<AnimatePresence>
			<motion.article className={scss.class} layoutId={id}>
				{PlayingCard ? <PlayingCard /> : null}
			</motion.article>
		</AnimatePresence>
	)
}
export const CardBack: FC<{ id: string }> = ({ id }) => {
	return (
		<AnimatePresence>
			<motion.article className={scss.class} layoutId={id}>
				{/* <PlayingCards.Back /> */}
			</motion.article>
		</AnimatePresence>
	)
}
