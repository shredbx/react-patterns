I'm using tailwindcss 4, I need to have a next packages:

package.json:

```
{
    "dependencies": {
        "tailwind-merge": "^3.3.0",
        "tw-animate-css": "^1.3.6"
},
    "devDependencies": {
        "@tailwindcss/postcss": "^4.1.11",
        "postcss": "^8",
        "prettier-plugin-tailwindcss": "^0.6.13",
        "tailwind-scrollbar": "^4.0.2",
        "tailwindcss": "^4.1.11",
    }
}
```

postcss.config.mjs:

```
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

```

globals.css:

```
@import "tailwindcss";
@plugin "tailwind-scrollbar";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@layer base {
  html {
    font-family: var(--font-open-sans), sans-serif;
    /* Fix for iPad Chrome CSS loading issues
    -webkit-text-size-adjust: none;
    text-size-adjust: none; */
  }
}

@theme inline {
  --font-open-sans: var(--font-open-sans);
  --font-montserrat: var(--font-montserrat);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  // ...
}

@theme inline {
  --color-tooltip: var(--foreground);
  --color-tooltip-foreground: var(--background);
}

:root {
  --background: oklch(1 0 0);
  // ...
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  // ...
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```
