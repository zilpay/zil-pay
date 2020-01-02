<template>
  <div :class="b()">
    <div :class="b('text-alert')">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alert'
}
</script>

<style lang="scss">
.Alert {
  display: grid;

  grid-template-rows: 1px 80px 1px;

  width: 100%;

  background-color: var(--theme-color-alert);

  &__text-alert {
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 5px;
  }

  &:before {
    content: "";
    display: block;

    width: 100%;
    height: 1px;

    background-color: var(--theme-color-alert-border);
  }

  &:after {
    content: "";
    display: block;

    width: 100%;
    height: 1px;

    background-color: var(--theme-color-alert-border);
  }
}
</style>
