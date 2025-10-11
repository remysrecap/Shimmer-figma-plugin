import {
  Button,
  Container,
  render,
  Text,
  VerticalSpace,
  Tabs,
  TabsOption
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState, useEffect } from 'preact/hooks'

import { CreateShimmerHandler, SelectionChangeHandler } from './types'

// Custom row styles following create-figma-plugin patterns
const customRowStyles = `
  .custom-row {
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin-bottom: 6px;
    border-radius: 6px;
    background: var(--figma-color-bg-secondary, #f5f5f5);
    transition: background-color 0.1s ease;
    font-size: 11px;
    line-height: 16px;
    min-height: 32px;
  }

  .custom-row:hover {
    background: var(--figma-color-bg-hover, #ebebeb);
  }

  .custom-row-label {
    flex: 1;
    font-weight: 400;
    color: var(--figma-color-text, #000000);
    margin-right: 12px;
    padding: 8px 0;
  }

  .custom-row-toggle {
    margin-right: 8px;
    padding: 8px 8px 8px 0;
    border-right: 1px solid #ffffff;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .custom-row-icon {
    width: 4px;
    height: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b3b3b3;
    cursor: pointer;
    border-radius: 2px;
    position: relative;
    margin-left: 4px;
    padding: 8px;
  }

  .custom-row-icon:hover {
    color: #8d8d8d;
  }

  .custom-toggle-switch {
    position: relative;
    width: 28px;
    height: 16px;
    flex-shrink: 0;
  }

  .custom-toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .custom-toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--figma-color-bg-disabled, #e5e5e5);
    transition: 0.2s;
    border-radius: 16px;
  }

  .custom-toggle-slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.2s;
    border-radius: 50%;
  }

  .custom-toggle-switch input:checked + .custom-toggle-slider {
    background-color: var(--figma-color-bg-brand, #18a0fb);
  }

  .custom-toggle-switch input:checked + .custom-toggle-slider:before {
    transform: translateX(12px);
  }

  .custom-info-icon {
    width: 4px;
    height: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3px;
    font-weight: bold;
    color: currentColor;
    background-color: currentColor;
    border-radius: 50%;
    color: white;
    line-height: 1;
  }

  .custom-tooltip {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11px;
    line-height: 16px;
    width: 200px;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    white-space: normal;
  }

  .custom-row-icon:hover .custom-tooltip {
    opacity: 1;
    pointer-events: auto;
  }
`

// Custom Toggle component
function CustomToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="custom-toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange((e.target as HTMLInputElement).checked)}
      />
      <span className="custom-toggle-slider"></span>
    </label>
  )
}

function Plugin() {
  const [autoFontWeight, setAutoFontWeight] = useState<boolean>(true)
  const [replaceText, setReplaceText] = useState<boolean>(true)
  const [hasValidSelection, setHasValidSelection] = useState<boolean>(false)
  const [selectionCount, setSelectionCount] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('Settings')

  // Custom Info icon component
  function CustomInfoIcon({ tooltip }: { tooltip: string }) {
    return (
      <span className="custom-row-icon">
        <div className="custom-info-icon">i</div>
        <div className="custom-tooltip">{tooltip}</div>
      </span>
    )
  }

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

  // Tab content components
  function SettingsContent() {
    return (
      <div style={{ padding: '12px' }}>
        <div className="custom-row">
          <div className="custom-row-label">Automatic font-weight</div>
          <div className="custom-row-toggle">
            <CustomToggle checked={autoFontWeight} onChange={setAutoFontWeight} />
          </div>
          <CustomInfoIcon tooltip="When enabled, text with font weight less than 500 (semibold) will be automatically made bold for optimal shimmer visibility." />
        </div>
        <div className="custom-row">
          <div className="custom-row-label">Replace text</div>
          <div className="custom-row-toggle">
            <CustomToggle checked={replaceText} onChange={setReplaceText} />
          </div>
          <CustomInfoIcon tooltip="When enabled, the selected text will be replaced with an animated shimmer component. When disabled, the original text remains and the component is created on the 'Shimmer component' page." />
        </div>
      </div>
    )
  }

  function AboutContent() {
    return (
      <div style={{ padding: '12px' }}>
        <Text>
          Create beautiful loading/shimmer effects for text in Figma. This plugin automatically converts selected text into animated shimmer components with customizable settings.
        </Text>
        <VerticalSpace space="medium" />
        <Text>
          <strong>Features:</strong>
        </Text>
        <VerticalSpace space="small" />
        <Text>• Automatic font-weight optimization</Text>
        <Text>• Hollow text with gradient animation</Text>
        <Text>• Component set creation with prototyping</Text>
        <Text>• Dedicated component page organization</Text>
        <Text>• Text replacement options</Text>
        <VerticalSpace space="medium" />
        <Text>
          <strong>Version:</strong> 1.0.0
        </Text>
        <Text>
          <strong>Author:</strong> Shimmer Plugin Team
        </Text>
      </div>
    )
  }

  function DonateContent() {
    return (
      <div style={{ padding: '12px' }}>
        <Text>Coming soon! We're working on adding donation options to support the development of this plugin.</Text>
        <VerticalSpace space="medium" />
        <Text>Thank you for using Shimmer Effect! 🙏</Text>
      </div>
    )
  }

  const tabs: TabsOption[] = [
    { value: 'Settings', children: null },
    { value: 'About', children: null },
    { value: 'Donate', children: null }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{customRowStyles}</style>
      
      <Tabs
        options={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
      />
      
      <div style={{ flex: 1 }}>
        {activeTab === 'Settings' && <SettingsContent />}
        {activeTab === 'About' && <AboutContent />}
        {activeTab === 'Donate' && <DonateContent />}
      </div>
      
      {activeTab === 'Settings' && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--figma-color-border, #e5e5e5)' }}>
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
        </div>
      )}
    </div>
  )
}

export default render(Plugin)