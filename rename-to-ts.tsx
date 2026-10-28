const fs = require("fs");
const path = require("path");

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public"]);
const SKIP_FILES = /\.config\.(js|mjs|cjs)$/; // next.config.js dll tetap JS

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(p);
    } else if (/\.(js|jsx)$/.test(e.name) && !SKIP_FILES.test(e.name)) {
      const src = fs.readFileSync(p, "utf8");
      const hasJsx = /<[A-Za-z][^>]*>|<\/|<>/.test(src);
      const np = p.replace(/\.(js|jsx)$/, hasJsx ? ".tsx" : ".ts");
      fs.renameSync(p, np);
      console.log(path.relative(process.cwd(), p), "->", path.basename(np));
    }
  }
}

walk(process.cwd());