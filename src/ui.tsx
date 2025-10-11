import {
  Button,
  Container,
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
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #E5E5E5;
  }

  .toggle-row:last-child {
    border-bottom: none;
  }

  .toggle-label {
    font-size: 11px;
    font-weight: 400;
    color: #000000;
    flex: 1;
  }

  .toggle-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle-switch {
    position: relative;
    width: 28px;
    height: 16px;
    flex-shrink: 0;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #E5E5E5;
    transition: .2s;
    border-radius: 34px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .2s;
    border-radius: 50%;
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: #18A0FB;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(12px);
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

// Toggle component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
      />
      <span className="toggle-slider"></span>
    </label>
  )
}

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
      
      <div className="toggle-row">
        <div className="toggle-label">Automatic font-weight</div>
        <div className="toggle-container">
          <Toggle checked={autoFontWeight} onChange={setAutoFontWeight} />
          <InfoIcon tooltip="If checked and the font weight is less than semibold (<500), we will automatically make it bold for the best shimmer effect." />
        </div>
      </div>
      
      <div className="toggle-row">
        <div className="toggle-label">Replace text</div>
        <div className="toggle-container">
          <Toggle checked={replaceText} onChange={setReplaceText} />
          <InfoIcon tooltip="If checked, the plugin will replace the selected text with an instance of the animated component. The component will be created on a separate 'Shimmer component' page." />
        </div>
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
