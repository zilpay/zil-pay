self.onmessage = function (e) {
  const { chunk } = e.data;

  // Имитируем тяжёлую работу (например, CPU bound)
  const result = chunk.map(x => {
    let y = x;
    for (let i = 0; i < 100; i++) {
      y = (y * y + 1) % 9999991;
    }
    return y;
  });

  self.postMessage({ result });
};
