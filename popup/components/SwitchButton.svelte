<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let checked = false;
  export let items: string[] = [];

  const dispatch = createEventDispatcher();

  const handleSelect = (e) => {
    dispatch('select', e.target.checked);
  };
</script>

<div class="switch-button" content={items[1]}>
  <input
    class="switch-button-checkbox"
    type="checkbox"
    on:input={handleSelect}
    checked={checked}
  />
  <label class="switch-button-label" for="">
    <span class="switch-button-label-span">
      {items[0]}
    </span>
  </label>
</div>

<style lang="scss">
  .switch-button {
    background: var(--card-color);
    border-radius: 30px;
    overflow: hidden;
    width: 240px;
    text-align: center;
    font-size: 18px;
    letter-spacing: 1px;
    color: var(--text-color);
    position: relative;
    padding-right: 120px;
    position: relative;

    &:before {
      content: attr(content);
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      pointer-events: none;
    }

    &-checkbox {
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      z-index: 2;

      &:checked + .switch-button-label:before {
        transform: translateX(120px);
        transition: transform 300ms linear;
      }

      & + .switch-button-label {
        position: relative;
        padding: 15px 0;
        display: block;
        user-select: none;
        pointer-events: none;

        &:before {
          content: "";
          background: var(--notification-color);
          height: 100%;
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
          border-radius: 30px;
          transform: translateX(0);
          transition: transform 300ms;
        }

        .switch-button-label-span {
          position: relative;
        }
      }
    }
  }
</style>
