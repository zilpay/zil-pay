import { DEFAULT } from 'config'

const { window } = global

export function isExpand() {
  const isWidth = window.innerWidth === DEFAULT.POPUP_WIDTH
  const isHeight = window.innerHeight === DEFAULT.POPUP_HEIGHT

  if (isWidth && isHeight) {
    return true
  }

  return false
}
