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

// Add tooltip styles
const tooltipStyles = `
  .row-item {
    display: flex;
    align-items: stretch;
    padding: 8px 20px 8px 16px;
    margin-bottom: 8px;
    border-radius: 6px;
    background: #F5F5F5;
    transition: background-color 0.1s ease;
  }

  .row-item:hover {
    background: #EBEBEB;
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

  .label {
    font-weight: 400;
    display: flex;
    align-items: center;
    width: 140px;
    margin-right: 4px;
  }

  .input-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    margin: -8px 0 -8px 0;
    padding: 8px 16px 8px 0;
    border-right: 1.5px solid #FFFFFF;
  }

  .right-aligned-content {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
  }

  .info-button {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: -8px -8px -8px -8px;
    padding: 0 6px;
    color: #666666;
    position: relative;
    z-index: 1000;
    cursor: pointer;
    flex-shrink: 0;
  }

  .info-button:hover {
    background: rgba(0, 0, 0, 0.06);
    border-radius: 0 6px 6px 0;
    color: #333333;
  }

  .info-button svg {
    width: 8px;
    height: 8px;
    fill: currentColor;
  }

  .tooltip {
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

  .info-button:hover .tooltip {
    opacity: 1;
    pointer-events: auto;
  }

  .tab-content {
    min-height: 200px;
    padding: 16px;
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid var(--figma-color-border);
    padding: 16px;
    z-index: 1000;
  }

  .main-content {
    padding-bottom: 80px; /* Space for fixed footer */
  }

  /* Remove default container padding and make tabs flush */
  .plugin-container {
    padding: 0 !important;
  }

  .tabs-container {
    margin: 0 -16px;
    padding: 0 16px;
    margin-top: -16px; /* Move tabs to y=0 */
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

function Plugin() {
  const [autoFontWeight, setAutoFontWeight] = useState<boolean>(true)
  const [replaceText, setReplaceText] = useState<boolean>(true)
  const [hasValidSelection, setHasValidSelection] = useState<boolean>(false)
  const [selectionCount, setSelectionCount] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('Settings')

  // Info icon component
  function InfoIcon({ tooltip }: { tooltip: string }) {
    return (
      <span className="info-button">
        <svg viewBox="0 0 12 12" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 12A6 6 0 106 0a6 6 0 000 12zM5.333 5.333v4h1.334v-4H5.333zm0-2.666V4h1.334V2.667H5.333z"
            fill="currentColor"
          />
        </svg>
        <div className="tooltip">{tooltip}</div>
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
      <div className="tab-content">
        <div className="row-item">
          <div className="label">Automatic font-weight</div>
          <div className="input-container">
            <div className="right-aligned-content">
              <Toggle checked={autoFontWeight} onChange={setAutoFontWeight} />
            </div>
          </div>
          <InfoIcon tooltip="If checked and the font weight is less than semibold (<500), we will automatically make it bold for the best shimmer effect." />
        </div>
        <div className="row-item">
          <div className="label">Replace text</div>
          <div className="input-container">
            <div className="right-aligned-content">
              <Toggle checked={replaceText} onChange={setReplaceText} />
            </div>
          </div>
          <InfoIcon tooltip="If checked, the plugin will replace the selected text with an instance of the animated component. The component will be created on a separate 'Shimmer component' page." />
        </div>
      </div>
    )
  }

  function AboutContent() {
    return (
      <div className="tab-content">
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
      <div className="tab-content">
        <Text>Coming soon! We're working on adding donation options to support the development of this plugin.</Text>
        <VerticalSpace space="medium" />
        <Text>Thank you for using Shimmer Effect! 🙏</Text>
      </div>
    )
  }

  const tabs: TabsOption[] = [
    { value: 'Settings', children: 'Settings' },
    { value: 'About', children: 'About' },
    { value: 'Donate', children: 'Donate' }
  ]

  return (
    <div className="main-content">
      <Container space="medium" className="plugin-container">
        <style>{tooltipStyles}</style>
        <VerticalSpace space="large" />
        
        <div className="tabs-container">
          <Tabs
            options={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
          />
        </div>
        
        <VerticalSpace space="medium" />
        
        {activeTab === 'Settings' && <SettingsContent />}
        {activeTab === 'About' && <AboutContent />}
        {activeTab === 'Donate' && <DonateContent />}
        
      </Container>
      
      <div className="footer">
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
    </div>
  )
}

export default render(Plugin)