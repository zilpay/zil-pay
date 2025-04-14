<script lang="ts">
  let output = "Ожидание…";

  function startParallelWork() {
    const numWorkers = 8;
    const data = Array.from({ length: 1000000 }, (_, i) => i);
    const chunkSize = Math.ceil(data.length / numWorkers);
    const results: number[][] = [];
    let completed = 0;

    for (let i = 0; i < numWorkers; i++) {
      const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);
      const worker = new Worker(chrome.runtime.getURL('background.js'));

      worker.onmessage = (e) => {
        results[i] = e.data.result;
        completed++;
        if (completed === numWorkers) {
          const combined = results.flat();
          output = `Готово! Всего элементов: ${combined.length}`;
          console.log("Первые 20 значений:", combined.slice(0, 20));
        }
      };

      worker.postMessage({ chunk });
    }
  }
</script>

<div>
  <h1>Parallel Workers</h1>
  <button on:click={startParallelWork}>Старт</button>
  <pre>{output}</pre>
</div>

<style lang="scss">
  div {
    font-family: sans-serif;
    padding: 1rem;

    button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 0.4rem;
      cursor: pointer;

      &:hover {
        background: #0059c1;
      }
    }

    pre {
      margin-top: 1rem;
      background: #f4f4f4;
      padding: 0.5rem;
      border-radius: 0.3rem;
    }
  }
</style>

