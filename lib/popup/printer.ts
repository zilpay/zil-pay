interface PrintMnemonicOptions {
  phrase: string;
  translations: string[];
  title: string;
}

export const printMnemonic = (options: PrintMnemonicOptions) => {
  const { phrase, translations, title } = options;
  return `<!DOCTYPE html>
<html id="print-wallet">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa; /* Light background for printing */
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }

    .print-container {
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      width: 80%; /* Occupies most of the width */
      max-width: 700px; /* Limits maximum width */
      padding: 30px;
      margin-bottom: 50px; /* Bottom margin */
    }

    .print-text {
      text-align: center;
    }

    p {
      margin-bottom: 1em;
      font-size: 1rem;
    }

    h3 {
      color: #555;
      letter-spacing: 0.03rem;
      margin-top: 1.5em;
      margin-bottom: 1em;
      font-size: 1.4rem;
      font-weight: 500;
    }

    .phrase {
      font-family: Menlo, Monaco, Consolas, 'Courier New', monospace !important;
      font-weight: bold !important;
      font-size: 1.2rem;
      background-color: #f0f8ff; /* Light background for the phrase */
      color: #1e3a8a; /* Accent color for the phrase */
      padding: 1rem;
      border: 1px solid #aed9fe;
      border-radius: 4px;
      margin: 2rem auto;
      max-width: 90%;
      word-break: break-word;
    }

    .footer {
      margin-top: 2em;
      font-size: 0.9rem;
      color: #777;
    }

    .footer a {
      color: #777;
      text-decoration: none;
    }

    @media print {
      body {
        background-color: #fff; /* White background when printing */
      }
      .print-container {
        border: 1px solid #000; /* Black border when printing */
        box-shadow: none; /* Removes shadow when printing */
      }
    }
  </style>
</head>
<body>
  <main class="print-container" id="print-container">
    <article class="print-text">
      <p>
        ${translations[0]}<br>
        ${translations[1]}<br>
        ${translations[2]}
      </p>
      <h3>${translations[3]}</h3>
      <div class="phrase">${phrase}</div>
      <p>
        ${translations[4]}
      </p>
      <p>
        ${translations[5]}
      </p>
      <p>
        ${translations[6]}
      </p>
      <aside class="footer">
        <a href="https://zilpay.io/" rel="noopener noreferrer" target="_blank">ZilPay Wallet</a>
      </aside>
    </article>
  </main>
</body>
</html>
`;
};
