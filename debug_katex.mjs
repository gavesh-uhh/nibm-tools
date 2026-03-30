import { marked } from "marked";
import markedKatex from "marked-katex-extension";

marked.use(markedKatex({ 
  throwOnError: false,
  displayMode: true
}));

const text = "Inline: $\\alpha$, Block: $$\\beta$$";

console.log("--- START ---");
console.log(marked.parse(text));
console.log("--- END ---");
