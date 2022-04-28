<script lang="ts">
	import Arrow from './icons/Arrow.svelte';

  export let img;
  export let symbol;
  export let percents = [10, 30, 50, 70, 100];
</script>

<label>
  <span>
    <img
      src={img}
      alt="input-token"
    />
    <h3>
      {symbol}
    </h3>
  </span>
  <div class="column">
    <input />
    <div>
      {#each percents as percent}
        <p>{percent}%</p>
      {/each}
    </div>
  </div>
</label>

<style lang="scss">
  @import "../styles/mixins";

	label {
		background-color: var(--card-color);
		border: solid 1px var(--card-color);
		
		@include border-radius(8px);
		@include flex-between-row;

		& > span {
			cursor: pointer;
			padding-left: 8px;
			padding-right: 8px;
			height: 80%;
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
			}
			& > div {
				display: flex;
				justify-content: flex-end;

				& > p {
					cursor: pointer;
					margin: 0;
					margin: 5px;

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
