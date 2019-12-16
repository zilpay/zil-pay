const EVENT_FOR_LISTENING = 'click'
const { window, document } = global


export function bind(el, binding, vnode) {
  window.event = function(event) {
    if (!(el === event.target || el.contains(event.target))) {
      vnode.context[binding.expression](event)
    }
  }

  document.body.addEventListener(EVENT_FOR_LISTENING, window.event)
}

export function unbind() {
  document.body.removeEventListener(EVENT_FOR_LISTENING, window.event)
}

export default {
  bind,
  unbind
}
