<template>
  <div :class="b()" />
</template>

<script>
export default {
  name: 'Separator'
}
</script>

<style lang="scss">
.Separator {
  width: 100%;
  height: 1px;
  border-radius: 50%;

  border-bottom: 0.1rem solid var(--theme-color-separator);

  background-color: var(--theme-color-separator);
}
</style>
