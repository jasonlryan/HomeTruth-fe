const { createRequire } = require("node:module");

// Keep the isolated preview on the same origin as its local API requests.
module.exports = app => {
  if (process.env.HOMETRUTH_PREVIEW_API_PROXY !== "true") return;
  const requireFromCRA = createRequire(require.resolve("react-scripts/package.json"));
  const { createProxyMiddleware } = requireFromCRA("http-proxy-middleware");
  app.use(createProxyMiddleware("/api", { target: "http://localhost:8005", changeOrigin: true }));
};
