import { TypeChecker } from 'lib/type'

import { INPUT_TYPES } from '@/components/Input'

// componentUpdated is a new hook that is called AFTER the entire component
// has completed the current update cycle. This means all the DOM would
// be in updated state when this hook is called. Also, this hook is always
// called regardless of whether this directive's value has changed or not.
export function componentUpdated(el, binding, vnode, oldVNode) {
  const { value } = binding
  const { attrs, model } = vnode.data

  if (attrs.type === INPUT_TYPES.number && !new TypeChecker(model.value).isInt) {
    value.type = false
  } else {
    value.type = true
  }

  if (attrs.pattern && !new RegExp(attrs.pattern).test(model.value)) {
    value.pattern = false
  } else {
    value.pattern = true
  }

  if (Number(attrs.minlength) > Number(model.value)) {
    value.minlength = false
  } else {
    value.minlength = true
  }
}

export default {
  componentUpdated
}
