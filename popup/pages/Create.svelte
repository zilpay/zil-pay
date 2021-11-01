<script lang="ts">
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { getRandomSeed } from "popup/backend/phrase";

  import SwitchButton from '../components/SwitchButton.svelte';

  let length = 128;
  let words = [];

  const hanldeRandomWords = async() => {
    const seed = await getRandomSeed(length);
    words = seed.split(' ');
  };
  const hanldeSelectNumber = (e) => {
    const value = e.detail;

    length = value ? 256 : 128;

    hanldeRandomWords();
  };
</script>

<main
in:fly={flyTransition.in}
out:fly={flyTransition.out}
>
  <h1>
    {$_('create.title')}
  </h1>
  <h3>
    {$_('create.sub_title')}
  </h3>
  <SwitchButton
    items={['12', '24']}
    on:select={hanldeSelectNumber}
  />
  <div class="btns">
    <button
      class="secondary"
      on:click={hanldeRandomWords}
    >
      {$_('create.btns.refresh')}
    </button>
    <button class="primary">
      {$_('create.btns.continue')}
    </button>
  </div>
</main>

<style type="text/scss">
	@import "../styles/mixins";
  h1, h3 {
    color: var(--text-color);
  }
  main {
		background-color: var(--background-color);
		height: 100vh;

    @include flex-center-top-column;
	}
  div.btns {
    width: 290px;
    @include flex-center-column;

    button {
      margin: 10px;
    }
  }
</style>
