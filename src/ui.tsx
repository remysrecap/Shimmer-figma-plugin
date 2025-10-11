import {
  Button,
  Checkbox,
  Container,
  Inline,
  render,
  Text,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState, useEffect } from 'preact/hooks'

import { CreateShimmerHandler, SelectionChangeHandler } from './types'

// Add tooltip styles
const tooltipStyles = `
  .info-button {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--figma-color-icon, #8D8D8D);
    position: relative;
    cursor: help;
    vertical-align: middle;
    margin-left: 4px;
  }

  .info-button:hover {
    color: var(--figma-color-text, #000000);
  }

  .info-button svg {
    width: 12px;
    height: 12px;
  }

  .tooltip {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 8px);
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 11px;
    line-height: 16px;
    width: 200px;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    white-space: normal;
    text-align: left;
  }

  .info-button:hover .tooltip {
    opacity: 1;
    pointer-events: auto;
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`

// Info icon component
function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <span className="info-button">
      <svg viewBox="0 0 12 12" fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6 12A6 6 0 106 0a6 6 0 000 12zM5.333 5.333v4h1.334v-4H5.333zm0-2.666V4h1.334V2.667H5.333z"
          fill="currentColor"
        />
      </svg>
      <div className="tooltip">{tooltip}</div>
    </span>
  )
}

function Plugin() {
  const [autoFontWeight, setAutoFontWeight] = useState<boolean>(true)
  const [replaceText, setReplaceText] = useState<boolean>(true)
  const [hasValidSelection, setHasValidSelection] = useState<boolean>(false)
  const [selectionCount, setSelectionCount] = useState<number>(0)
  
  // Listen for selection changes from main thread
  useEffect(() => {
    on<SelectionChangeHandler>('SELECTION_CHANGE', ({ hasValidSelection, selectionCount }) => {
      setHasValidSelection(hasValidSelection)
      setSelectionCount(selectionCount)
    })
  }, [])
  
  const handleCreateShimmerButtonClick = useCallback(
    function () {
      if (hasValidSelection) {
        emit<CreateShimmerHandler>('CREATE_SHIMMER', autoFontWeight, replaceText)
      }
    },
    [autoFontWeight, replaceText, hasValidSelection]
  )
  
  return (
    <Container space="medium">
      <style>{tooltipStyles}</style>
      <VerticalSpace space="large" />
      <Text>
        <strong>Shimmer Effect</strong>
      </Text>
      <VerticalSpace space="medium" />
      <Inline space="extraSmall">
        <Checkbox
          onValueChange={setAutoFontWeight}
          value={autoFontWeight}
        >
          <Text>Automatic font-weight</Text>
        </Checkbox>
        <InfoIcon tooltip="If checked and the font weight is less than semibold (<500), we will automatically make it bold for the best shimmer effect." />
      </Inline>
      <VerticalSpace space="small" />
      <Inline space="extraSmall">
        <Checkbox
          onValueChange={setReplaceText}
          value={replaceText}
        >
          <Text>Replace text</Text>
        </Checkbox>
        <InfoIcon tooltip="If checked, the plugin will replace the selected text with an instance of the animated component. The component will be created on a separate 'Shimmer component' page." />
      </Inline>
      <VerticalSpace space="extraLarge" />
      <Button 
        fullWidth 
        onClick={handleCreateShimmerButtonClick}
        disabled={!hasValidSelection}
      >
        {hasValidSelection 
          ? `Create Shimmer (${selectionCount} text layer${selectionCount !== 1 ? 's' : ''})`
          : 'Select text layer'
        }
      </Button>
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
