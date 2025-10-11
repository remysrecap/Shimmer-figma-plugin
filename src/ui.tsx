import {
  render
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState, useEffect } from 'preact/hooks'

import { CreateShimmerHandler, SelectionChangeHandler } from './types'

// Custom styles for the entire plugin
const customStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 11px;
    line-height: 16px;
    color: #000000;
    background: #ffffff;
  }

  .plugin-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #ffffff;
  }

  .plugin-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #e5e5e5;
  }

  .plugin-title {
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #000000;
  }

  .plugin-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    background: #000000;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    font-size: 10px;
  }

  .close-button {
    width: 16px;
    height: 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: #000000;
    font-size: 14px;
  }

  .tabs-container {
    display: flex;
    border-bottom: 1px solid #e5e5e5;
  }

  .tab {
    flex: 1;
    padding: 12px 16px;
    background: #f8f8f8;
    border: none;
    cursor: pointer;
    font-size: 11px;
    font-weight: 400;
    color: #666666;
    transition: all 0.1s ease;
  }

  .tab.active {
    background: #ffffff;
    font-weight: 500;
    color: #000000;
    border-bottom: 2px solid #000000;
  }

  .tab:hover:not(.active) {
    background: #f0f0f0;
    color: #000000;
  }

  .tab-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .tab-title {
    font-size: 11px;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16px;
  }

  .settings-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 6px;
    background: #f5f5f5;
    transition: background-color 0.1s ease;
  }

  .settings-row:hover {
    background: #ebebeb;
  }

  .settings-label {
    flex: 1;
    font-size: 11px;
    font-weight: 400;
    color: #000000;
  }

  .settings-toggle {
    margin-right: 16px;
  }

  .settings-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8d8d8d;
    cursor: pointer;
    border-radius: 2px;
    position: relative;
  }

  .settings-icon:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #333333;
  }

  .toggle-switch {
    position: relative;
    width: 28px;
    height: 16px;
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
    background-color: #e5e5e5;
    transition: 0.2s;
    border-radius: 16px;
  }

  .toggle-slider:before {
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

  .toggle-switch input:checked + .toggle-slider {
    background-color: #18a0fb;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(12px);
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

  .settings-icon:hover .tooltip {
    opacity: 1;
    pointer-events: auto;
  }

  .footer {
    padding: 16px;
    border-top: 1px solid #e5e5e5;
    background: #ffffff;
  }

  .action-button {
    width: 100%;
    padding: 12px 16px;
    background: #f8f8f8;
    border: none;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: #666666;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .action-button:enabled {
    background: #18a0fb;
    color: #ffffff;
  }

  .action-button:hover:enabled {
    background: #0d8ce8;
  }

  .about-content {
    font-size: 11px;
    line-height: 16px;
    color: #000000;
  }

  .about-content p {
    margin-bottom: 12px;
  }

  .about-content strong {
    font-weight: 600;
  }

  .about-content ul {
    margin-left: 16px;
    margin-bottom: 12px;
  }

  .about-content li {
    margin-bottom: 4px;
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
      <span className="info-icon" style={{ position: 'relative' }}>
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
      <div>
        <div className="tab-title">Settings</div>
        <div className="settings-row">
          <div className="settings-label">Automatic font-weight</div>
          <div className="settings-toggle">
            <Toggle checked={autoFontWeight} onChange={setAutoFontWeight} />
          </div>
          <div className="settings-icon">
            <InfoIcon tooltip="If checked and the font weight is less than semibold (<500), we will automatically make it bold for the best shimmer effect." />
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-label">Replace text</div>
          <div className="settings-toggle">
            <Toggle checked={replaceText} onChange={setReplaceText} />
          </div>
          <div className="settings-icon">
            <InfoIcon tooltip="If checked, the plugin will replace the selected text with an instance of the animated component. The component will be created on a separate 'Shimmer component' page." />
          </div>
        </div>
      </div>
    )
  }

  function AboutContent() {
    return (
      <div className="about-content">
        <p>Create beautiful loading/shimmer effects for text in Figma. This plugin automatically converts selected text into animated shimmer components with customizable settings.</p>
        <p><strong>Features:</strong></p>
        <ul>
          <li>Automatic font-weight optimization</li>
          <li>Hollow text with gradient animation</li>
          <li>Component set creation with prototyping</li>
          <li>Dedicated component page organization</li>
          <li>Text replacement options</li>
        </ul>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Author:</strong> Shimmer Plugin Team</p>
      </div>
    )
  }

  function DonateContent() {
    return (
      <div className="about-content">
        <p>Coming soon! We're working on adding donation options to support the development of this plugin.</p>
        <p>Thank you for using Shimmer Effect! 🙏</p>
      </div>
    )
  }


  return (
    <div className="plugin-container">
      <style>{customStyles}</style>
      
      <div className="plugin-header">
        <div className="plugin-title">
          <div className="plugin-icon">&lt;/&gt;</div>
          Shimmer
        </div>
        <button className="close-button">×</button>
      </div>
      
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'Settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('Settings')}
        >
          Settings
        </button>
        <button 
          className={`tab ${activeTab === 'About' ? 'active' : ''}`}
          onClick={() => setActiveTab('About')}
        >
          About
        </button>
        <button 
          className={`tab ${activeTab === 'Donate' ? 'active' : ''}`}
          onClick={() => setActiveTab('Donate')}
        >
          Donate
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'Settings' && <SettingsContent />}
        {activeTab === 'About' && <AboutContent />}
        {activeTab === 'Donate' && <DonateContent />}
      </div>
      
      <div className="footer">
        <button
          className="action-button"
          onClick={handleCreateShimmerButtonClick}
          disabled={!hasValidSelection}
        >
          {hasValidSelection
            ? `Create Shimmer (${selectionCount} text layer${selectionCount !== 1 ? 's' : ''})`
            : 'Select text layer'
          }
        </button>
      </div>
    </div>
  )
}

export default render(Plugin)