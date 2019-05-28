export default function(el, binding) {
  el.addEventListener('mouseenter', function () {
    const $tooltip = document.createElement('div');
    const $tooltipDimension = el.getBoundingClientRect();
    $tooltip.setAttribute('class', 'tooltip');
    $tooltip.setAttribute('id', 'id_Tooltip');
    $tooltip.innerHTML = binding.value;
    $tooltip.style.left = $tooltipDimension.left + ($tooltipDimension.width / 2) + 'px';
    $tooltip.style.top = $tooltipDimension.top - 30 + 'px';
    document.body.appendChild($tooltip);
  });
  el.addEventListener('mouseleave', function () {
    const elemToRemove = document.getElementById('id_Tooltip');
    
    if (!elemToRemove) {
      return null;
    }

    elemToRemove.parentNode.removeChild(elemToRemove);
  });
}
