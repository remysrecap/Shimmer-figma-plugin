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
  .checkbox-with-tooltip {
    display: flex;
    align-items: center;
  }

  .info-button {
    width: 12px;
    height: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #B3B3B3;
    position: relative;
    cursor: help;
    flex-shrink: 0;
    margin-left: 6px;
    margin-top: 1px;
  }

  .info-button:hover {
    color: #8D8D8D;
  }

  .info-button svg {
    width: 10px;
    height: 10px;
  }

  .tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11px;
    line-height: 16px;
    width: 220px;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    white-space: normal;
    text-align: left;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .info-button:hover .tooltip {
    opacity: 1;
    pointer-events: auto;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 12px;
    border: 5px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.9);
  }
`

// Info icon component
function InfoIcon({ tooltip }: { tooltip: string }) {
  const [tooltipStyle, setTooltipStyle] = useState<any>({})
  const iconRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      const rect = node.getBoundingClientRect()
      setTooltipStyle({
        top: `${rect.bottom + 8}px`,
        left: `${rect.left - 12}px`
      })
    }
  }, [])

  return (
    <span className="info-button" ref={iconRef}>
      <svg viewBox="0 0 12 12" fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6 12A6 6 0 106 0a6 6 0 000 12zM5.333 5.333v4h1.334v-4H5.333zm0-2.666V4h1.334V2.667H5.333z"
          fill="currentColor"
        />
      </svg>
      <div className="tooltip" style={tooltipStyle}>{tooltip}</div>
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
      <div className="checkbox-with-tooltip">
        <Checkbox
          onValueChange={setAutoFontWeight}
          value={autoFontWeight}
        >
          <Text>Automatic font-weight</Text>
        </Checkbox>
        <InfoIcon tooltip="If checked and the font weight is less than semibold (<500), we will automatically make it bold for the best shimmer effect." />
      </div>
      <VerticalSpace space="small" />
      <div className="checkbox-with-tooltip">
        <Checkbox
          onValueChange={setReplaceText}
          value={replaceText}
        >
          <Text>Replace text</Text>
        </Checkbox>
        <InfoIcon tooltip="If checked, the plugin will replace the selected text with an instance of the animated component. The component will be created on a separate 'Shimmer component' page." />
      </div>
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
