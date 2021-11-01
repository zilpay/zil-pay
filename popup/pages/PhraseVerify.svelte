<script lang="ts">
	import { push } from 'svelte-spa-router';
	import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { getRandomSeed } from "popup/backend/phrase";
  import { shuffle } from 'lib/utils/shuffle';

  import BackBar from '../components/BackBar.svelte';
  import PickButton from '../components/PickButton.svelte';

  let words = [];
  let shuffled = [];

  onMount(() => {
    words = window['words'];
    
    if (!Array.isArray(words) || words.length < 12) {
      return push('/create');
    }

    shuffled = shuffle<string>(words);
  });
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <BackBar
    length={3}
    selected={1}
  />
  <h1>
    {$_('verify.title')}
  </h1>
  <div class="picker">
    <p>
      {$_('verify.placeholder')}
    </p>
  </div>
  <div class="wrapper">
    {#each shuffled as word}
      <PickButton text={word}/>
    {/each}
  </div>
  <button
    class="primary"
  >
    {$_('verify.btn')}
  </button>
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
  div.wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    height: fit-content;
    width: calc(100vw - 10px);

    max-width: 500px;
  }
  div.picker {
		background-color: var(--card-color);
    border-radius: 6px;
    border: 1px dashed var(--border-color);

    height: fit-content;
    width: calc(100vw - 10px);
    max-width: 600px;
    min-height: 300px;

    display: flex;
    align-items: center;
    justify-content: center;

    & > p {
      font-size: 16px;
      text-align: center;
    }
  }
  button {
    margin: 16px;
    min-width: 290px;
  }
</style>
