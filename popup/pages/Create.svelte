<script lang="ts">
	import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import flyTransition from 'popup/transitions/fly';
	import { _ } from 'popup/i18n';
	import { getRandomSeed } from "popup/backend/phrase";

  import SwitchButton from '../components/SwitchButton.svelte';
  import BackBar from '../components/BackBar.svelte';

  let length = 128;
  let words = [];

	$: disabled = words.length < 12;

  const hanldeRandomWords = async() => {
    const seed = await getRandomSeed(length);
    words = seed.split(' ');
  };
  const hanldeSelectNumber = (e) => {
    const value = e.detail;

    length = value ? 256 : 128;

    hanldeRandomWords();
  };

  onMount(() => {
    hanldeRandomWords();
  });
</script>

<main
  in:fly={flyTransition.in}
  out:fly={flyTransition.out}
>
  <BackBar
    length={3}
    selected={0}
  />
  <h1>
    {$_('create.title')}
  </h1>
  <h3>
    {$_('create.sub_title')}
  </h3>
  <div>
    <SwitchButton
      items={['12', '24']}
      on:select={hanldeSelectNumber}
    />
  </div>
  <div class="wrapper">
    {#each words as w, i}
      <div>
        <span class="number">
          {i + 1}
        </span>
        <span class="word">
          {w}
        </span>
      </div>
    {/each}
  </div>
  <div class="btns">
    <button
      class="secondary"
      on:click={hanldeRandomWords}
    >
      {$_('create.btns.refresh')}
    </button>
    <button
      class="primary"
      disabled={disabled}
    >
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
  div.wrapper {
    margin: 16px;
    overflow-y: scroll;

    height: fit-content;
    max-height: calc(100vh - 90px);
    max-width: 350px;

    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;

    & > div {
      padding: 10px;
      line-height: 16px;
      min-width: 103px;
      text-align: center;

      & > span {
        font-size: 14px;
        line-height: 21px;
      }

      & > span.number {
        color: var(--muted-color);
      }
      & > span.word {
        color: var(--text-color);
      }
    }
  }
</style>
