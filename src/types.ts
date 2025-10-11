import { EventHandler } from '@create-figma-plugin/utilities'

export interface CreateShimmerHandler extends EventHandler {
  name: 'CREATE_SHIMMER'
  handler: (autoFontWeight: boolean) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}

export interface SelectionChangeHandler extends EventHandler {
  name: 'SELECTION_CHANGE'
  handler: (data: { hasValidSelection: boolean; selectionCount: number }) => void
}
