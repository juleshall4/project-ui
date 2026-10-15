/**
 * Writes registry.json from the theme in src/index.css, so the showcase stays
 * the single source of truth. Run `bun run registry` to rebuild public/r.
 */
import postcss, { type ChildNode } from "postcss";

const source = await Bun.file("src/index.css").text();
const motionSource = await Bun.file("src/motion.css").text();

function block(selector: string): string {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Missing ${selector} block in src/index.css`);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}" && --depth === 0) return source.slice(start, i);
  }
  throw new Error(`Unclosed ${selector} block`);
}

function variables(source: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [, name, value] of source.matchAll(/^\s*--([\w-]+):\s*(.+?);\s*$/gm)) {
    result[name] = value;
  }
  return result;
}

// Helper inputs such as --brand-h and fonts are not colours, so they go in plain CSS
// rules. As cssVars, shadcn would also map them into @theme.
const helpers = /^(brand-[lhc]|raised-shadow-\d|font-(body|display))$/;

function split(source: string) {
  const all = Object.entries(variables(source));
  return {
    colours: Object.fromEntries(all.filter(([name]) => !helpers.test(name))),
    rules: Object.fromEntries(all.filter(([name]) => helpers.test(name)).map(([n, v]) => [`--${n}`, v])),
  };
}

const light = split(block(":root"));
const dark = split(block(".dark"));
const cssVars = {
  dark: dark.colours,
  light: light.colours,
  theme: variables(block("@theme inline")),
};

type CssObject = { [key: string]: string | CssObject };

/** Converts motion.css into shadcn's nested css object, merging repeated selectors. */
function toCssObject(nodes: ChildNode[]): CssObject {
  const result: CssObject = {};
  for (const node of nodes) {
    if (node.type === "decl") {
      result[node.prop] = node.important ? `${node.value} !important` : node.value;
    } else if (node.type === "rule" || node.type === "atrule") {
      const key =
        node.type === "rule" ? node.selector.replace(/\s+/g, " ") : `@${node.name} ${node.params}`;
      const existing = result[key];
      result[key] = { ...(typeof existing === "object" ? existing : {}), ...toCssObject(node.nodes ?? []) };
    }
  }
  return result;
}

const motion = toCssObject(postcss.parse(motionSource).nodes);
const { ":root": motionTokens, ...motionRules } = motion;

const css = {
  ...Object.fromEntries(
    [...source.matchAll(/^@import "(@fontsource[^"]+)";$/gm)].map(([, name]) => [`@import "${name}"`, {}]),
  ),
  ":root": { ...light.rules, ...(motionTokens as CssObject) },
  ".dark": dark.rules,
  ...motionRules,
  "@layer base": {
    "*": { "@apply border-border outline-ring/50": {} },
    "#root": { isolation: "isolate" },
    body: { "@apply bg-background text-foreground": {}, position: "relative" },
    "code, kbd, samp, pre": { "font-family": "var(--font-mono)" },
    html: { "@apply font-sans antialiased": {} },
  },
};

const dependencies = [
  "@base-ui/react",
  "class-variance-authority",
  "lucide-react",
  "@fontsource-variable/tiktok-sans",
  "@fontsource-variable/geist-mono",
];

const coss = (name: string) => `https://coss.com/ui/r/${name}.json`;

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  homepage: "https://github.com/juleshall4/project-ui",
  items: [
    {
      css,
      cssVars,
      dependencies,
      description: "Project UI colours, radius, fonts, shadows, and motion for Coss UI. Light and dark.",
      devDependencies: ["tw-animate-css"],
      name: "theme",
      registryDependencies: ["utils"],
      title: "Project UI theme",
      type: "registry:theme",
    },
    {
      description: "Coss Button with raised, soft, and magic variants and a press effect.",
      files: [{ path: "src/components/ui/button.tsx", type: "registry:ui" }],
      name: "button",
      registryDependencies: [coss("button")],
      title: "Button",
      type: "registry:ui",
    },
    {
      css,
      cssVars,
      dependencies,
      description: "Every Coss component, the Project UI theme, and the Project UI button.",
      devDependencies: ["tw-animate-css"],
      files: [{ path: "src/components/ui/button.tsx", type: "registry:ui" }],
      name: "project-ui",
      registryDependencies: ["utils", coss("ui")],
      title: "Project UI",
      type: "registry:item",
    },
  ],
  name: "project-ui",
};

await Bun.write("registry.json", `${JSON.stringify(registry, null, 2)}\n`);
console.log(`registry.json: ${Object.keys(cssVars.light).length} light, ${Object.keys(cssVars.dark).length} dark, ${Object.keys(cssVars.theme).length} theme variables`);
