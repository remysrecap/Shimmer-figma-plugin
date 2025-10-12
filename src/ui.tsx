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
          <div className="custom-row-label">Automatic font-weight</div>
          <div className="custom-row-toggle">
            <CustomToggle checked={autoFontWeight} onChange={setAutoFontWeight} />
          </div>
          <CustomInfoIcon tooltip="If the selected text has a font weight that's too light for the shimmer effect, it will be automatically made bold for better visibility." />
        </div>
        <div className="custom-row">
          <div className="custom-row-label">Replace text</div>
          <div className="custom-row-toggle">
            <CustomToggle checked={replaceText} onChange={setReplaceText} />
          </div>
          <CustomInfoIcon tooltip="If the original text should be replaced with the shimmer component, it will be swapped out. If not, the original text stays and the component is created on the 'Shimmer component' page." />
        </div>
      </div>
    )
  }

  function AboutContent() {
    const howItWorksContent = (
      <div style={{ padding: '12px', fontSize: '11px', lineHeight: '16px' }}>
        <Text>The Shimmer Effect plugin transforms your text into animated loading components through a series of automated steps:</Text>
        <VerticalSpace space="medium" />
        <Text><strong>1. Text Analysis</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>The plugin analyzes your selected text layer, checking its font weight and dimensions.</Text>
        <VerticalSpace space="small" />
        <Text><strong>2. Vector Conversion</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Text is converted to vector paths and styled with a hollow/outlined appearance using masking.</Text>
        <VerticalSpace space="small" />
        <Text><strong>3. Layer Creation</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>A light grey background and white gradient layer are added to create the shimmer effect.</Text>
        <VerticalSpace space="small" />
        <Text><strong>4. Component Generation</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Two component variants are created (start and end states) and combined into a component set.</Text>
        <VerticalSpace space="small" />
        <Text><strong>5. Animation Setup</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Smart animate prototyping is configured to create the smooth shimmer animation loop.</Text>
      </div>
    )

    const animationSettingsContent = (
      <div style={{ padding: '12px', fontSize: '11px', lineHeight: '16px' }}>
        <Text>The shimmer animation uses carefully tuned timing and easing for optimal visual effect:</Text>
        <VerticalSpace space="medium" />
        <Text><strong>Animation Duration</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>The gradient sweep takes 1200ms (1.2 seconds) to travel across the text.</Text>
        <VerticalSpace space="small" />
        <Text><strong>Initial Delay</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>A 600ms delay occurs before the animation starts, creating a natural pause.</Text>
        <VerticalSpace space="small" />
        <Text><strong>Easing</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Ease-out easing is applied for smooth deceleration at the end of the animation.</Text>
        <VerticalSpace space="small" />
        <Text><strong>Loop Behavior</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>The animation instantly resets after completion with a 1ms delay, creating a seamless loop.</Text>
        <VerticalSpace space="small" />
        <Text><strong>Gradient Design</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>White gradient fades from 0% to 100% opacity at center, then back to 0%, creating a natural shimmer.</Text>
      </div>
    )

    const componentOrgContent = (
      <div style={{ padding: '12px', fontSize: '11px', lineHeight: '16px' }}>
        <Text>The plugin organizes generated components in a dedicated page for easy management:</Text>
        <VerticalSpace space="medium" />
        <Text><strong>Shimmer Component Page</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>All shimmer components are automatically placed on a page called "Shimmer component".</Text>
        <VerticalSpace space="small" />
        <Text><strong>Reusable Components</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Components are created as variants, making them easy to reuse and maintain across your design.</Text>
        <VerticalSpace space="small" />
        <Text><strong>Component Styling</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Component sets have a distinctive purple dashed outline (#9747FF) for easy identification.</Text>
        <VerticalSpace space="small" />
        <Text><strong>Instance Placement</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>When "Replace text" is enabled, an instance is placed at the original text location.</Text>
        <VerticalSpace space="small" />
        <Text><strong>Page Management</strong></Text>
        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>If the page already exists, new components are added there; otherwise, a new page is created.</Text>
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
            marginBottom: '4px'
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
            Create beautiful loading/shimmer effects for text in Figma. This plugin automatically converts selected text into animated shimmer components with customizable settings.
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
          <div 
            onClick={() => handleOpenModal('Component organization', componentOrgContent)}
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
            <span style={{ fontSize: '11px', fontWeight: '400' }}>Component organization</span>
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