<template>
  <div :class="b()">
    <div :class="b('input-range-tracker')" />
    <div :class="b('input-range-tracker-between')" />
    <input
      :class="b('range-lower')"
      type="range"
      name="range-lower"
    >
    <input
      :class="b('range-upper')"
      type="range"
      name="range-upper"
    >
  </div>
</template>

<script>
export default {
  name: 'DoubleRange'
}
</script>

<style lang="scss">
$input-range-thumb-height: 20px;
$input-range-tracker-height: 10px;
$input-range-lower-thumb-color: LightSkyBlue;
$input-range-upper-thumb-color: RebeccaPurple;

.DoubleRange {
  position: relative;
	width: 200px;
	height: $input-range-thumb-height;

  &__input-range-tracker {
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: $input-range-tracker-height;
    margin-top: -$input-range-tracker-height / 2;
    border-radius: 10px;
    background: LightGray;
    pointer-events: none;
  }

  &__input-range-tracker-between {
    position: absolute;
    left: 0;
    top: 50%;
    width: 0;
    height: $input-range-tracker-height;
    margin-top: -$input-range-tracker-height / 2;
    border-radius: 10px;
    background: LightSalmon;
    pointer-events: none;
  }
}
input[type="range"] {
	appearance: none;
	position: absolute;
	display: block;
	width: 100%;
	background: transparent;

	&.DoubleRange__display-upper {
		z-index: 1;
	}
}

input[type="range"]:not(*:root) {
	pointer-events: none;
}

input[type="range"]::-webkit-slider-runnable-track {
	background: transparent;
}

input[type="range"] {
	&::-webkit-slider-thumb,
	&::-webkit-media-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border: 0;
		border-radius: 50%;
		pointer-events: auto;
	}
}
input[name="range-lower"] {
	&::-webkit-slider-thumb,
	&::-webkit-media-slider-thumb {
		background: $input-range-lower-thumb-color;
	}
}

input[name="range-upper"] {
	&::-webkit-slider-thumb,
	&::-webkit-media-slider-thumb {
		background: $input-range-upper-thumb-color;
	}
}

// Firefox
input[type="range"]::-moz-range-track {
	background: transparent;
}

input[type="range"]::-moz-range-thumb {
	appearance: none;
	width: 20px;
	height: 20px;
	border: 0;
	border-radius: 50%;
	pointer-events: auto;
}

input[name="range-lower"]::-moz-range-thumb {
	background: $input-range-lower-thumb-color;
}

input[name="range-upper"]::-moz-range-thumb {
	background: $input-range-upper-thumb-color;
}
</style>
