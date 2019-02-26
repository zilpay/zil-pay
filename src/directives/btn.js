export default function(el, binding) {
  let colorDef = 'info';
  let className = 'btn btn-outline-';
  let localName = 'button';

  if (binding.value) {
    className += binding.value;
  } else {
    className += colorDef;
  }

  if (el.localName == localName) {
    el.type = 'button';
  }

  el.className = className;
}
