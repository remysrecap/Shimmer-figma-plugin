import {
  Button,
  Checkbox,
  Container,
  IconInfo16,
  Inline,
  render,
  Text,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState, useEffect } from 'preact/hooks'

import { CreateShimmerHandler, SelectionChangeHandler } from './types'

function Plugin() {
  const [autoFontWeight, setAutoFontWeight] = useState<boolean>(true)
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
        emit<CreateShimmerHandler>('CREATE_SHIMMER', autoFontWeight)
      }
    },
    [autoFontWeight, hasValidSelection]
  )
  
  return (
    <Container space="medium">
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
        <IconInfo16 
          title="If checked and the font weight is less than semibold (<500), we will automatically make it bold for the best shimmer effect."
        />
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
