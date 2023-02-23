import type { FC, ReactNode } from "react"
import { useMemo } from "react"

export const Repeater: FC<{
  children: ReactNode
  count: number
}> = ({ children, count }) => {
  const items = useMemo(() => {
    const items: ReactNode[] = []
    for (let i = 0; i < count; i++) {
      items.push(children)
    }
    return items
  }, [children, count])
  return <>{items}</>
}
