const { readFile } = require("node:fs/promises");
const { createRequire } = require("node:module");

// Keep the isolated preview on the same origin as its local API requests.
module.exports = app => {
  if (process.env.HOMETRUTH_PREVIEW_API_PROXY !== "true") return;
  const requireFromCRA = createRequire(require.resolve("react-scripts/package.json"));
  if (process.env.NODE_ENV === "development" &&
      process.env.REACT_APP_LOCAL_ADMIN_LOGIN === "true" &&
      process.env.HOST === "127.0.0.1" && process.env.PORT === "3014" &&
      process.env.HOMETRUTH_LOCAL_ADMIN_ENV_FILE) {
    serveLocalAdminLogin(app, requireFromCRA("dotenv").parse);
  }

  const { createProxyMiddleware } = requireFromCRA("http-proxy-middleware");
  if (process.env.NODE_ENV === "development" && process.env.HOST === "127.0.0.1" &&
      process.env.PORT === "3014" && process.env.REACT_APP_LOCAL_APPLIANCE_FLOW === "true") {
    if (process.env.REACT_APP_HOMEOWNER_DEMO === "true" &&
        process.env.HOMETRUTH_LOCAL_MAYA_EMAIL === "maya.demo@example.invalid" &&
        process.env.HOMETRUTH_LOCAL_MAYA_PASSWORD) {
      serveLocalMayaLogin(app, {
        email: process.env.HOMETRUTH_LOCAL_MAYA_EMAIL,
        password: process.env.HOMETRUTH_LOCAL_MAYA_PASSWORD
      });
    }
    app.use(createProxyMiddleware("/api/ai_chat", { target: "http://127.0.0.1:8015", changeOrigin: true }));
    app.use(createProxyMiddleware(path => /^\/api\/property-records\/[1-9]\d*\/items(?:\/|$)/.test(path), { target: "http://127.0.0.1:8014", changeOrigin: true }));
  }
  app.use(createProxyMiddleware("/api", { target: process.env.HOMETRUTH_PREVIEW_API_TARGET || "http://localhost:8005", changeOrigin: true }));
};

// One successful sign-in per explicitly enabled loopback server, for 20 minutes.
function serveLocalAdminLogin(app, parseEnv) {
  const expiresAt = Date.now() + 20 * 60_000;
  let used = false;
  let pending = false;
  app.post("/_local/admin-login", async (req, res) => {
    res.set("Cache-Control", "no-store");
    const host = req.get("host");
    const loopbackHost = host === "localhost:3014" || host === "127.0.0.1:3014";
    if (req.socket.remoteAddress !== "127.0.0.1" || !loopbackHost ||
        req.get("origin") !== `http://${host}` || req.get("sec-fetch-site") !== "same-origin" ||
        req.get("x-hometruth-local-admin") !== "1") {
      return res.sendStatus(403);
    }
    if (used || Date.now() >= expiresAt) {
      return res.status(410).json({ message: "This temporary admin login is no longer active." });
    }
    if (pending) return res.status(409).json({ message: "An admin login is already in progress." });

    pending = true;
    try {
      const localEnv = parseEnv(await readFile(process.env.HOMETRUTH_LOCAL_ADMIN_ENV_FILE));
      const email = localEnv.LOCAL_ADMIN_EMAIL;
      const password = localEnv.LOCAL_ADMIN_PASSWORD;
      if (!email || !password) throw new Error("Local admin credentials unavailable");
      const response = await fetch("http://127.0.0.1:8005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      });
      const result = await response.json();
      if (!response.ok || typeof result.data?.token !== "string" || result.data?.user?.role !== "admin") {
        return res.status(403).json({ message: "The local credentials did not pass HomeTruth’s admin login check." });
      }
      used = true;
      return res.json({ data: { token: result.data.token, user: result.data.user } });
    } catch {
      return res.status(503).json({ message: "The temporary admin login is unavailable." });
    } finally {
      pending = false;
    }
  });
}


// The local demo opens the existing synthetic customer using the normal password check.
function serveLocalMayaLogin(app, { email, password }) {
  app.post("/_local/maya-login", async (req, res) => {
    res.set("Cache-Control", "no-store");
    const host = req.get("host");
    if (req.socket.remoteAddress !== "127.0.0.1" ||
        !["localhost:3014", "127.0.0.1:3014"].includes(host) ||
        req.get("origin") !== `http://${host}` || req.get("sec-fetch-site") !== "same-origin" ||
        req.get("x-hometruth-local-maya") !== "1") return res.sendStatus(403);

    try {
      const response = await fetch("http://127.0.0.1:8005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        redirect: "error",
        signal: AbortSignal.timeout(5000)
      });
      const { data } = await response.json();
      if (!response.ok || typeof data?.token !== "string" || data?.user?.email !== email ||
          !["user", "customer"].includes(data.user.role)) {
        return res.status(403).json({ message: "Couldn’t open the local Maya customer account." });
      }
      return res.json({ data: { user: data.user, token: data.token } });
    } catch {
      return res.status(503).json({ message: "The local Maya sign-in is unavailable." });
    }
  });
}
