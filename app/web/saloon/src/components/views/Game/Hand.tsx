import type { FC } from "react"

import { useO } from "atom.io/react"
import { AnimatePresence } from "framer-motion"

import { dealCardsTX, groupsOfCardsState } from "~/app/node/lodge/src/store/game"

import { CardBack, CardFace } from "./Card"
import { myHandsIndex } from "./store/my-hands-index"
import { publicDeckIndex } from "./store/public-deck-index"
import { useRemoteTransaction } from "../../../services/store"
import { Button } from "../../containers/Button"
import { Div } from "../../containers/Div"

export const Hand: FC<{ id: string }> = ({ id }) => {
  const isMyHand = useO(myHandsIndex).includes(id)
  const cardIds = useO(groupsOfCardsState).getRelatedIds(id)
  const publicDeckIds = useO(publicDeckIndex)

  const dealCards = useRemoteTransaction(dealCardsTX)

  return (
    <AnimatePresence>
      <Div.DropShadowDiagon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Button.FlashFire
          onClick={() =>
            dealCards({ deckId: publicDeckIds[0], handId: id, count: 1 })
          }
        >
          Deal
        </Button.FlashFire>
        {isMyHand
          ? cardIds.map((cardId) => <CardFace key={cardId} id={cardId} />)
          : cardIds.map((cardId) => <CardBack key={cardId} id={cardId} />)}
        <div>{cardIds.length}</div>
      </Div.DropShadowDiagon>
    </AnimatePresence>
  )
}
