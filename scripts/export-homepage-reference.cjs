// Build the portable catalogue from the same React source used by the app.
const { cpSync, mkdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const webpack = require("webpack");

const root = path.resolve(__dirname, "..");
const target = process.argv[2];
if (!target) throw new Error("Pass the output directory for the homepage reference.");
const output = path.resolve(target);
const component = path.join(root, "src/components/homepage");
const entry = path.join(root, "src/dev/homepageReference.jsx");

const compiler = webpack({
  context: root,
  mode: "production",
  entry,
  output: { path: output, filename: "homepage.js" },
  resolve: { extensions: [".js", ".jsx"] },
  module: {
    rules: [
      { test: /\.css$/, type: "asset/source" },
      {
        test: /\.jsx$/,
        include: path.join(root, "src"),
        use: {
          loader: require.resolve("babel-loader"),
          options: { babelrc: false, configFile: false, presets: [require.resolve("@babel/preset-react")] },
        },
      },
    ],
  },
  performance: { hints: false },
});

compiler.run((error, stats) => {
  compiler.close(closeError => {
    if (error || closeError || stats?.hasErrors()) {
      console.error(error || closeError || stats.toString({ all: false, errors: true }));
      process.exitCode = 1;
      return;
    }

    mkdirSync(path.join(output, "src/components"), { recursive: true });
    cpSync(component, path.join(output, "src/components/homepage"), { recursive: true });
    cpSync(path.join(root, "public/assets/homepage"), path.join(output, "src/components/homepage/assets"), { recursive: true });
    mkdirSync(path.join(output, "src/dev"), { recursive: true });
    cpSync(entry, path.join(output, "src/dev/homepageReference.jsx"));
    writeFileSync(path.join(output, "index.html"), `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HomeTruth · Homepage journey</title>
<link rel="stylesheet" href="src/components/homepage/styles/tokens.css">
<link rel="stylesheet" href="src/components/homepage/styles/components.css">
<link rel="stylesheet" href="src/components/homepage/styles/navigation.css">
<link rel="stylesheet" href="src/components/homepage/styles/journey.css">
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif}
.preview-label,.preview-handoff{padding:10px 5%;background:#f5f7f8;color:#48515d;font-size:13px}
.preview-label{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px}
.preview-label a{color:inherit}
.preview-handoff{position:fixed;z-index:2;bottom:0;right:0;left:0;border-top:1px solid #c4c4c4}
.preview-handoff button{margin-left:8px;font:inherit}
</style>
<script defer src="homepage.js"></script>
</head>
<body><div id="homepage-reference"></div></body>
</html>
`);
    console.log(output);
  });
});
