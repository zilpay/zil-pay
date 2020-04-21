import { DEFAULT } from 'config'

export function isExpand() {
  const isWidth = global.innerWidth === DEFAULT.POPUP_WIDTH
  const isHeight = global.innerHeight === DEFAULT.POPUP_HEIGHT

  if (isWidth && isHeight) {
    return true
  }

  return false
}
