export default function(el, binding) {
  el.addEventListener('mouseenter', function () {
    var $tooltip = document.createElement('div')
    var $tooltipDimension = el.getBoundingClientRect()
    $tooltip.setAttribute('class', 'tooltip')
    $tooltip.setAttribute('id', 'id_Tooltip')
    $tooltip.innerHTML = binding.value
    $tooltip.style.left = $tooltipDimension.left + ($tooltipDimension.width / 2) + 'px'
    $tooltip.style.top = $tooltipDimension.top - 30 + 'px'
    document.body.appendChild($tooltip)
  });
  el.addEventListener('mouseleave', function () {
    var elemToRemove = document.getElementById('id_Tooltip')
    elemToRemove.parentNode.removeChild(elemToRemove)
  });
}
