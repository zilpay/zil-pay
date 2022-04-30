<script lang="ts">
	import Big from 'big.js';
  import { createEventDispatcher } from 'svelte';

	import Arrow from './icons/Arrow.svelte';

	Big.PE = 99;
  const dispatch = createEventDispatcher();

	export let percents = [10, 30, 50, 70, 100];
  export let loading = false;
	export let placeholder = '';
	export let max = '0';
  export let img;
  export let symbol;
	export let value;

	const onClick = () => {
    dispatch('select');
  };
	const onInput = (e) => {
		if (isNaN(Number(value))) {
			return;
		}

		dispatch('input', String(value));
  };
	const onPercentInput = (n: number) => {
		try {
			const _100 = Big(100);
			const _n = Big(n);
			const _max = Big(max);
			const _value = _max.mul(_n).div(_100);

			dispatch('input', String(_value));
		} catch (err) {
			console.log(err);
		}
	};
</script>

<label class:loading={loading}>
  <span on:click={onClick}>
    <img
      src={img}
      alt="input-token"
    />
    <h3>
      {symbol}
    </h3>
  </span>
  <div class="column">
    <input
			bind:value={value}
			placeholder={placeholder}
			disabled={loading}
			on:input={onInput}
		/>
    <div>
      {#each percents as percent}
        <p on:click={() => onPercentInput(percent)}>{percent}%</p>
      {/each}
    </div>
  </div>
</label>

<style lang="scss">
  @import "../styles/mixins";

	label {
		background-color: var(--card-color);
		border: solid 1px var(--card-color);
		width: 100%;
		
		@include border-radius(8px);
		@include flex-between-row;

		&.loading {
			border: solid 1px transparent;
      @include loading-gradient(var(--background-color), var(--card-color));

			& > span {
				cursor: inherit;
			}
    }

		& > span {
			cursor: pointer;
			padding-left: 8px;
			padding-right: 8px;
			height: 80%;
			min-width: 80px;
			border-right: 1px solid var(--muted-color);

			@include flex-between-row;

			& > img {
				height: 30px;
				width: 30px;
			}
			& > h3 {
				padding-left: 3px;
				padding-right: 3px;
			}
		}
		& > div.column {
			padding: 8px;

			& > input {
				width: 100%;
				height: auto;
				font-size: 18px;
				padding: 0;
				border-color: var(--card-color);

				&:disabled {
					cursor: inherit;
					background: transparent;
					border-color: transparent;
				}
			}
			& > div {
				display: flex;
				justify-content: flex-end;

				& > p {
					cursor: pointer;
					margin: 0;
					margin: 5px;
					font-size: 12px;

					&:hover {
						color: var(--text-color);
					}
				}
			}
		}

		&:focus-within {
			border: solid 1px var(--text-color);
		}
	}
</style>
