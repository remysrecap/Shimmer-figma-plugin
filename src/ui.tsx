import {
  Button,
  Container,
  render,
  Text,
  VerticalSpace,
  Tabs,
  TabsOption,
  Modal
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h, JSX } from 'preact'
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
    width: 12px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8d8d8d;
    cursor: pointer;
    border-radius: 2px;
    position: relative;
    margin-left: 4px;
  }

  .custom-row-icon:hover {
    color: #666666;
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

  .custom-icon svg {
    width: 6px;
    height: 6px;
    fill: currentColor;
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
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [modalContent, setModalContent] = useState<{ title: string; content: JSX.Element } | null>(null)

  // Custom Info icon component
  function CustomInfoIcon({ tooltip }: { tooltip: string }) {
    return (
      <span className="custom-row-icon">
        <svg viewBox="0 0 12 12" fill="none" className="custom-icon">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 12A6 6 0 106 0a6 6 0 000 12zM5.333 5.333v4h1.334v-4H5.333zm0-2.666V4h1.334V2.667H5.333z"
            fill="currentColor"
          />
        </svg>
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

  const handleOpenModal = useCallback((title: string, content: JSX.Element) => {
    setModalContent({ title, content })
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  // Tab content components
  function SettingsContent() {
    return (
      <div style={{ padding: '12px' }}>
        <div className="custom-row">
          <div className="custom-row-label">Auto-bold adjustment</div>
          <div className="custom-row-toggle">
            <CustomToggle checked={autoFontWeight} onChange={setAutoFontWeight} />
          </div>
          <CustomInfoIcon tooltip="Automatically update font-weights to bold to ensure better visibility of the shimmer effect." />
        </div>
        <div className="custom-row">
          <div className="custom-row-label">Replace text layer</div>
          <div className="custom-row-toggle">
            <CustomToggle checked={replaceText} onChange={setReplaceText} />
          </div>
          <CustomInfoIcon tooltip="Replace the selected text layer with an instance of the animated component." />
        </div>
      </div>
    )
  }

  function AboutContent() {
    const howItWorksContent = (
      <div style={{ padding: '12px 12px 28px 12px', minHeight: '50vh' }}>
        <p style={{ fontSize: '11px', lineHeight: '16px', margin: '0 0 12px 0', color: 'rgba(0, 0, 0, 0.8)' }}>
          Select text, click Generate Shimmer, and the plugin automatically converts it into an animated component with hollow text, gradient overlay, and looping animation.
        </p>
        <p style={{ fontSize: '11px', lineHeight: '16px', margin: '0', color: 'rgba(0, 0, 0, 0.8)' }}>
          All components are organized on a dedicated "Shimmer component" page. If this page doesn't exist, it's automatically created. If it already exists, new components are added there for easy management and reuse.
        </p>
      </div>
    )

    const animationSettingsContent = (
      <div style={{ padding: '12px 12px 28px 12px', minHeight: '50vh' }}>
        <p style={{ fontSize: '11px', lineHeight: '16px', margin: '0', color: 'rgba(0, 0, 0, 0.8)' }}>
          The shimmer animation creates a smooth, looping effect using smart animate. A white gradient sweeps across the text over 1.2 seconds with ease-out easing for natural deceleration. After a 1 second initial pause, the animation begins and seamlessly loops with an instant reset, creating a continuous shimmer effect perfect for loading states.
        </p>
      </div>
    )

    return (
      <div style={{ padding: '12px' }}>
        <div style={{ marginBottom: '16px' }}>
          <code style={{
            display: 'inline-block',
            fontFamily: "'SF Mono', 'Roboto Mono', monospace",
            fontSize: '8px',
            lineHeight: '1.5',
            color: 'var(--figma-color-text, #000000)',
            background: 'var(--figma-color-bg, #ffffff)',
            padding: '2px 6px',
            borderRadius: '6px',
            border: '1px solid var(--figma-color-border, rgba(0, 0, 0, 0.1))',
            whiteSpace: 'pre-wrap',
            marginBottom: '8px'
          }}>1.0</code>
          <h3 style={{
            fontSize: '11px',
            fontWeight: '500',
            marginBottom: '4px',
            margin: '0 0 4px 0'
          }}>Shimmer Effect Plugin</h3>
          <p style={{
            fontSize: '11px',
            lineHeight: '16px',
            marginBottom: '12px',
            marginTop: '4px',
            color: 'rgba(0, 0, 0, 0.8)'
          }}>
            Create beautiful loading/shimmer effects for text in Figma. This plugin automatically converts selected text into animated shimmer components.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div 
            onClick={() => handleOpenModal('How it works', howItWorksContent)}
            style={{
              background: 'var(--figma-color-row-bg, #F5F5F5)',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '400' }}>How it works</span>
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" style={{ opacity: 0.3 }}>
              <path d="M1 1L4.5 4.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div 
            onClick={() => handleOpenModal('Animation settings', animationSettingsContent)}
            style={{
              background: 'var(--figma-color-row-bg, #F5F5F5)',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '400' }}>Animation settings</span>
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" style={{ opacity: 0.3 }}>
              <path d="M1 1L4.5 4.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
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
    { value: 'About', children: null }
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
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--figma-color-border, #e5e5e5)' }}>
          <Button
            fullWidth
            onClick={handleCreateShimmerButtonClick}
            disabled={!hasValidSelection || selectionCount > 1}
          >
            {!hasValidSelection
              ? 'Select text layer'
              : selectionCount > 1
              ? 'Select single text layer'
              : (replaceText ? 'Generate and replace' : 'Generate shimmer')
            }
          </Button>
        </div>
      )}

      <Modal 
        onCloseButtonClick={handleCloseModal} 
        open={modalOpen} 
        position="bottom" 
        title={modalContent?.title || ''}
      >
        {modalContent?.content}
      </Modal>
    </div>
  )
}

export default render(Plugin)