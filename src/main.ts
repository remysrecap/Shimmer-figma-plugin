import { emit, once, showUI } from '@create-figma-plugin/utilities'

import { CreateShimmerHandler, SelectionChangeHandler } from './types'

export default function () {
  once<CreateShimmerHandler>('CREATE_SHIMMER', async function (autoFontWeight: boolean, replaceText: boolean) {
    try {
      // Check if text is selected
      const selection = figma.currentPage.selection
      if (selection.length === 0) {
        figma.notify('Please select a text layer', { error: true })
        return
      }

      // Check if selection is text
      const textNodes = selection.filter(node => node.type === 'TEXT') as TextNode[]
      if (textNodes.length === 0) {
        figma.notify('Please select a text layer', { error: true })
        return
      }

      // Check if only one text node is selected
      if (textNodes.length > 1) {
        figma.notify('Please select only one text layer', { error: true })
        return
      }

      // Find or create "Shimmer component" page
      let shimmerPage = figma.root.children.find(page => page.name === 'Shimmer component')
      if (!shimmerPage) {
        shimmerPage = figma.createPage()
        shimmerPage.name = 'Shimmer component'
      }

      // Process the single text node
      await createShimmerEffect(textNodes[0], autoFontWeight, replaceText, shimmerPage)

      figma.notify('Created shimmer effect')
      figma.closePlugin()
    } catch (error) {
      console.error('Error creating shimmer effect:', error)
      figma.notify('Error creating shimmer effect', { error: true })
    }
  })

        showUI({
          height: 380,
          width: 322
        })

  // Wait for UI to be ready, then check initial selection
  setTimeout(() => {
    updateUI()
  }, 100)

  // Listen for selection changes
  figma.on('selectionchange', () => {
    updateUI()
  })

  function updateUI() {
    try {
      const selection = figma.currentPage.selection
      const textNodes = selection.filter(node => node.type === 'TEXT') as TextNode[]
      
      // Send selection status to UI
      emit<SelectionChangeHandler>('SELECTION_CHANGE', {
        hasValidSelection: textNodes.length > 0,
        selectionCount: textNodes.length
      })
    } catch (error) {
      // UI not ready yet, will retry on next selection change
    }
  }
}

async function createShimmerEffect(textNode: TextNode, autoFontWeight: boolean, replaceText: boolean, shimmerPage: PageNode) {
  // 1. Load font before any text operations
  if (textNode.fontName !== figma.mixed) {
    await figma.loadFontAsync(textNode.fontName)
  }
  
  // 2. Check and optionally increase font weight
  if (autoFontWeight && textNode.fontName !== figma.mixed) {
    const currentFont = textNode.fontName as FontName
    
    // Only try to make bold if current weight is less than semibold (500)
    if (typeof textNode.fontWeight === 'number' && textNode.fontWeight < 500) {
      // Try to find a bolder font variant
      // Priority: 700 (Bold), 800+ (ExtraBold/Black), 600 (Semibold), 500 (Medium)
      const weightOptions = [
        { weight: 700, styles: ['Bold', '700'] },
        { weight: 800, styles: ['ExtraBold', 'Extra Bold', 'Extrabold', '800'] },
        { weight: 900, styles: ['Black', 'Heavy', '900'] },
        { weight: 600, styles: ['Semibold', 'SemiBold', 'Semi Bold', 'Demi Bold', 'DemiBold', '600'] },
        { weight: 500, styles: ['Medium', '500'] }
      ]
      
      let boldApplied = false
      
      for (const option of weightOptions) {
        for (const style of option.styles) {
          try {
            const boldFont = { family: currentFont.family, style: style }
            await figma.loadFontAsync(boldFont)
            textNode.fontName = boldFont
            boldApplied = true
            console.log(`Applied ${style} weight to improve shimmer visibility`)
            break
          } catch (error) {
            // This style doesn't exist, try next one
            continue
          }
        }
        if (boldApplied) break
      }
      
      if (!boldApplied) {
        console.warn(`No bold variant found for ${currentFont.family}. Shimmer effect may be less visible with light font weights.`)
      }
    }
  }

  // 3. Convert text to vector using flatten method and create hollow effect
  const textCopy = textNode.clone()
  textCopy.name = 'Text Copy'
  
  // Convert text to vector paths
  const vectorText = figma.flatten([textCopy])
  vectorText.name = 'Text Vector'
  
  // Create hollow text with 100% fill for masking
  const hollowText = vectorText.clone()
  hollowText.name = 'Hollow Text'
  hollowText.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 }, // White fill at 100%
    opacity: 1
  }]
  hollowText.isMask = true // Enable "use as mask"
  
  // 4. Create background rectangle (light grey, 50% opacity)
  const background = figma.createRectangle()
  background.name = 'Background'
  background.resize(hollowText.width, hollowText.height)
  background.x = hollowText.x
  background.y = hollowText.y
         background.fills = [{
           type: 'SOLID',
           color: { r: 0.9, g: 0.9, b: 0.9 }, // Light grey
           opacity: 0.3
         }]

  // 5. Create gradient rectangle for shimmer effect
  const gradient = figma.createRectangle()
  gradient.name = 'Shimmer Gradient'
  gradient.resize(hollowText.width, hollowText.height)
  gradient.x = hollowText.x - hollowText.width // Start at negative position
  gradient.y = hollowText.y
  
  // Create white gradient: 0% opacity -> 100% opacity -> 0% opacity
  gradient.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientStops: [
      { position: 0, color: { r: 1, g: 1, b: 1, a: 0 } }, // 0% opacity
      { position: 0.5, color: { r: 1, g: 1, b: 1, a: 1 } }, // 100% opacity
      { position: 1, color: { r: 1, g: 1, b: 1, a: 0 } }   // 0% opacity
    ],
    gradientTransform: [[1, 0, 0], [0, 1, 0]]
  }]

  // 6. Create clipped frame containing all elements
  const frame = figma.createFrame()
  frame.name = 'Container'
  frame.resize(hollowText.width, hollowText.height)
  frame.x = hollowText.x
  frame.y = hollowText.y
  frame.clipsContent = true
  frame.fills = [] // Transparent background

  // Add elements to frame in correct order (text mask at bottom, background in middle, gradient on top)
  // Hollow text as mask at bottom, background in middle, gradient on top
  frame.appendChild(hollowText)
  frame.appendChild(background)
  frame.appendChild(gradient)

  // Center all elements within the frame and set frame position to 0,0
  frame.x = 0
  frame.y = 0
  background.x = 0
  background.y = 0
  hollowText.x = 0
  hollowText.y = 0
  gradient.x = -hollowText.width // Start at negative position relative to frame
  gradient.y = 0

  // 7. Create second component (end state)
  const frameEnd = frame.clone()
  frameEnd.name = 'Container'
  
  // Move gradient to positive position and ensure frame is at 0,0
  frameEnd.x = 0
  frameEnd.y = 0
  const endGradient = frameEnd.children.find(child => child.name === 'Shimmer Gradient') as RectangleNode
  if (endGradient) {
    endGradient.x = hollowText.width // End at positive position relative to frame
  }

  // 8. Create component set with styling
  const component1 = figma.createComponent()
  component1.name = 'Shimmer Start'
  component1.resize(frame.width, frame.height)
  component1.x = frame.x
  component1.y = frame.y
  component1.appendChild(frame)

  const component2 = figma.createComponent()
  component2.name = 'Shimmer End'
  component2.resize(frameEnd.width, frameEnd.height)
  component2.x = frameEnd.x + 200 // Offset for visibility
  component2.y = frameEnd.y
  component2.appendChild(frameEnd)

  // 9. Create component set with variants
  const componentSet = figma.combineAsVariants([component1, component2], figma.currentPage)
  componentSet.name = 'Shimmer Effect'

  // Style the component set frame
  componentSet.strokes = [{
    type: 'SOLID',
    color: { r: 0.592, g: 0.278, b: 1 }, // #9747FF
    opacity: 1
  }]
  componentSet.strokeWeight = 2
  componentSet.dashPattern = [8, 4] // Dashed outline
  componentSet.fills = [
    {
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 }, // White background
      opacity: 1
    },
    {
      type: 'SOLID', 
      color: { r: 0.592, g: 0.278, b: 1 }, // #9747FF
      opacity: 0.3
    }
  ]

  // Position component set right under the original text
  componentSet.x = textNode.x
  componentSet.y = textNode.y + textNode.height + 20 // 20px gap below text

  // 10. Add interactive reactions using setReactionsAsync
  // Start -> End: After timeout 600ms (0.6s), Smart animate 1200ms (1.2s) with ease out
  await component1.setReactionsAsync([{
    trigger: {
      type: 'AFTER_TIMEOUT',
      timeout: 0.6 // 600ms delay (in seconds)
    },
    actions: [{
      type: 'NODE',
      destinationId: component2.id,
      navigation: 'CHANGE_TO',
      transition: {
        type: 'SMART_ANIMATE',
        duration: 1.2, // 1200ms duration (in seconds)
        easing: {
          type: 'EASE_OUT' // Ease out as requested
        }
      }
    }]
  }])

  // End -> Start: 1ms delay (0.001s) with instant transition
  await component2.setReactionsAsync([{
    trigger: {
      type: 'AFTER_TIMEOUT',
      timeout: 0.001 // 1ms delay (in seconds)
    },
    actions: [{
      type: 'NODE',
      destinationId: component1.id,
      navigation: 'CHANGE_TO',
      transition: null // Instant transition (no animation)
    }]
  }])

  // Store original text position and parent before moving component
  const originalX = textNode.x
  const originalY = textNode.y
  const originalParent = textNode.parent

  // Move component set to shimmer page
  shimmerPage.appendChild(componentSet)
  
  // Position component set at a clean location on the shimmer page
  // Find the rightmost component on the page to place new one next to it
  let maxX = 0
  for (const child of shimmerPage.children) {
    if (child.id !== componentSet.id) {
      const rightEdge = child.x + child.width
      if (rightEdge > maxX) {
        maxX = rightEdge
      }
    }
  }
  componentSet.x = maxX > 0 ? maxX + 100 : 0
  componentSet.y = 0

  // Clean up cloned nodes
  try {
    textCopy.remove()
  } catch (error) {
    // Already removed
  }
  
  try {
    vectorText.remove()
  } catch (error) {
    // Already removed
  }

  // Handle text replacement
  if (replaceText) {
    // Create an instance of the first component (start state)
    const instance = component1.createInstance()
    
    // Place instance where the original text was
    if (originalParent && 'appendChild' in originalParent) {
      originalParent.appendChild(instance)
    }
    instance.x = originalX
    instance.y = originalY
    
    // Remove original text node
    try {
      textNode.remove()
    } catch (error) {
      // Already removed
    }
    
    // Select the instance
    figma.currentPage.selection = [instance]
    figma.viewport.scrollAndZoomIntoView([instance])
  } else {
    // Keep the original text, just select the component set on shimmer page
    const currentPage = figma.currentPage
    figma.currentPage = shimmerPage
    figma.currentPage.selection = [componentSet]
    figma.viewport.scrollAndZoomIntoView([componentSet])
    // Switch back to original page
    figma.currentPage = currentPage
  }
}
