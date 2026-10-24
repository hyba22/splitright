# SplitRight

A website that helps roommates split rent and bills fairly. Split by room size, percentage or fixed amounts, and every share adds up to the exact cent.

## Features

* **Four ways to split:** equal, percentage, ratio (like room size in m²) and fixed amounts with the rest shared equally.
* **Exact to the cent:** amounts are calculated in whole cents, and leftover cents go to the people closest to rounding up (largest remainder method). The total always matches.
* **Clear explanations:** a badge shows who received an extra cent and why.
* **Most world currencies:** US dollar, euro and Algerian dinar first, with correct decimals for every currency.
* **English and French**, plus light and dark themes.
* **Mobile friendly** layout.

## Tech stack

React, TypeScript, Vite, Tailwind CSS and Vitest.

## Getting started

```bash
npm install
npm run dev
```

Run the tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## Roadmap

1. Itemized bills (rent, utilities, internet), each with its own split method
2. Saved households and monthly history
3. Share links, installable app (PWA) and deployment on Cloudflare Pages

## Author

Made by [Hyba](https://github.com/hyba22).
