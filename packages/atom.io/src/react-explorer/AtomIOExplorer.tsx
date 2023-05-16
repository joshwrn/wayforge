import type { FC, ReactNode } from "react"
import { useEffect } from "react"

import { Link, MemoryRouter, useLocation } from "react-router-dom"

import type { composeStoreHooks } from "~/packages/atom.io/src/react"
import { ErrorBoundary } from "~/packages/hamr/src/react-error-boundary"
import type { WC } from "~/packages/hamr/src/react-json-editor"

import type { ExplorerState } from "./explorer-states"
import { attachExplorerState } from "./explorer-states"
import { setState } from ".."
import { runTransaction } from "../transaction"

export type ExplorerOptions = {
  key: string
  Components?: {
    SpaceWrapper: WC
    CloseSpaceButton: FC<{ onClick: () => void }>
  }
  storeHooks: ReturnType<typeof composeStoreHooks>
}

const DEFAULT_COMPONENTS: ExplorerOptions[`Components`] = {
  SpaceWrapper: ({ children }) => <div>{children}</div>,
  CloseSpaceButton: ({ onClick }) => <button onClick={onClick}>X</button>,
}

export const composeExplorer = ({
  key,
  Components,
  storeHooks: { useO, useIO },
}: ExplorerOptions): ExplorerState & {
  Explorer: FC<{ children: ReactNode }>
  useSetTitle: (viewId: string) => void
} => {
  const { SpaceWrapper, CloseSpaceButton } = {
    ...DEFAULT_COMPONENTS,
    ...Components,
  }

  const state = attachExplorerState(key)

  const {
    addSpace,
    addView,
    allViewsState,
    findSpaceFocusedViewState,
    findSpaceLayoutNode,
    findSpaceViewsState,
    findViewFocusedState,
    findViewState,
    removeSpace,
    removeView,
    spaceLayoutState,
    viewIndexState,
  } = state

  const View: FC<{
    children: ReactNode
    viewId: string
  }> = ({ children, viewId }) => {
    const location = useLocation()
    const viewState = findViewState(viewId)
    const [view, setView] = useIO(viewState)
    useEffect(() => {
      setView((view) => ({ ...view, location }))
    }, [location.key])
    return (
      <div className="view">
        <header>
          <h1>{view.title}</h1>
          <CloseSpaceButton onClick={() => runTransaction(removeView)(viewId)} />
        </header>
        <main>{children}</main>
        <footer>
          <nav>
            {location.pathname.split(`/`).map((pathPiece, idx, array) =>
              pathPiece === `` && idx === 1 ? null : (
                <Link
                  to={array.slice(0, idx + 1).join(`/`)}
                  key={`${pathPiece}_${viewId}`}
                >
                  {idx === 0 ? `home` : pathPiece}/
                </Link>
              )
            )}
          </nav>
        </footer>
      </div>
    )
  }

  const Space: FC<{
    children: ReactNode
    viewId: string
  }> = ({ children, viewId }) => {
    const view = useO(findViewState(viewId))
    return (
      <div className="space">
        <ErrorBoundary>
          <MemoryRouter initialEntries={[view.location.pathname]}>
            <View viewId={viewId}>{children}</View>
          </MemoryRouter>
        </ErrorBoundary>
      </div>
    )
  }

  const Spaces: FC<{ children: ReactNode; nodeKey?: string }> = ({
    children,
    nodeKey = `root`,
  }) => {
    const spaceLayout = useO(findSpaceLayoutNode(nodeKey))
    const viewIds = useO(findSpaceViewsState(nodeKey))
    const focusedViewId = useO(findSpaceFocusedViewState(nodeKey))
    console.log({ spaceLayout, viewIds, focusedViewId })
    return (
      <div className="spaces">
        {spaceLayout.childKeys.length === 0 ? (
          focusedViewId ? (
            <Space viewId={focusedViewId}>{children}</Space>
          ) : (
            `no view`
          )
        ) : (
          spaceLayout.childKeys.map((childKey) => (
            <Spaces key={childKey} nodeKey={childKey}>
              {children}
            </Spaces>
          ))
        )}
        <button onClick={() => runTransaction(addView)({ spaceKey: nodeKey })}>
          + View
        </button>
        <button onClick={() => runTransaction(addSpace)(nodeKey)}>
          + Space
        </button>
      </div>
    )
  }

  const Explorer: FC<{ children: ReactNode }> = ({ children }) => {
    return <Spaces>{children}</Spaces>
  }

  const useSetTitle = (title: string): void => {
    let location: ReturnType<typeof useLocation>
    try {
      location = useLocation()
    } catch (thrown) {
      console.warn(
        `Failed to set title to "${title}"; useSetTitle must be called within the children of Explorer`
      )
      return
    }
    const views = useO(allViewsState)
    const locationView = views.find(
      ([, view]) => view.location.key === location.key
    )
    const viewId = locationView?.[0] ?? null
    useEffect(() => {
      if (viewId) {
        setState(findViewState(viewId), (v) => ({ ...v, title }))
      }
    }, [viewId])
  }

  return { Explorer, useSetTitle, ...state }
}
