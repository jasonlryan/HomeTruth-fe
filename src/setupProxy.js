const { readFile } = require("node:fs/promises");
const { createRequire } = require("node:module");

const loopback = (value, fallback) => {
  const port = value || fallback;
  if (!/^[1-9]\d{0,4}$/.test(port) || Number(port) > 65535) {
    throw new Error("Expected a valid loopback port for the local demo.");
  }
  return `http://127.0.0.1:${port}`;
};

const sameOriginDemoRequest = (req, port, header) => {
  const host = req.get("host");
  return req.socket.remoteAddress === "127.0.0.1" &&
    [`localhost:${port}`, `127.0.0.1:${port}`].includes(host) &&
    req.get("origin") === `http://${host}` && req.get("sec-fetch-site") === "same-origin" &&
    req.get(header) === "1";
};

module.exports = app => {
  if (process.env.HOMETRUTH_PREVIEW_API_PROXY !== "true") return;
  const requireFromCRA = createRequire(require.resolve("react-scripts/package.json"));
  const { createProxyMiddleware } = requireFromCRA("http-proxy-middleware");
  const port = process.env.REACT_APP_LOCAL_DEMO_PORT || "3014";
  const isLocalDemo = process.env.NODE_ENV === "development" && process.env.HOST === "127.0.0.1" &&
    process.env.PORT === port && process.env.REACT_APP_LOCAL_APPLIANCE_FLOW === "true";

  if (isLocalDemo) {
    const core = loopback(process.env.HOMETRUTH_LOCAL_CORE_API_PORT, "8005");
    const ask = loopback(process.env.HOMETRUTH_LOCAL_ASK_API_PORT, "8015");
    const items = loopback(process.env.HOMETRUTH_LOCAL_ITEMS_API_PORT, "8014");
    if (process.env.REACT_APP_LOCAL_ADMIN_LOGIN === "true" && process.env.HOMETRUTH_LOCAL_ADMIN_ENV_FILE) {
      serveLocalAdminLogin(app, requireFromCRA("dotenv").parse, { core, port });
    }
    if (process.env.REACT_APP_HOMEOWNER_DEMO === "true" &&
        process.env.HOMETRUTH_LOCAL_MAYA_EMAIL === "maya.demo@example.invalid" &&
        process.env.HOMETRUTH_LOCAL_MAYA_PASSWORD) {
      serveLocalMayaLogin(app, {
        email: process.env.HOMETRUTH_LOCAL_MAYA_EMAIL,
        password: process.env.HOMETRUTH_LOCAL_MAYA_PASSWORD,
        core, port,
      });
    }
    app.use(createProxyMiddleware("/api/ai_chat", { target: ask, changeOrigin: true }));
    app.use(createProxyMiddleware(path => /^\/api\/property-records\/[1-9]\d*\/items(?:\/|$)/.test(path), { target: items, changeOrigin: true }));
    const surveyPort = process.env.HOMETRUTH_LOCAL_SURVEY_API_PORT;
    if (surveyPort) {
      const survey = loopback(surveyPort);
      app.use(createProxyMiddleware(path => /^\/api\/(?:user-documents\/[1-9]\d*\/pdf-page|property-records\/[1-9]\d*\/tasks(?:\/|$))/.test(path), { target: survey, changeOrigin: true }));
    }
    app.use(createProxyMiddleware("/api", { target: core, changeOrigin: true }));
    return;
  }

  app.use(createProxyMiddleware("/api", { target: process.env.HOMETRUTH_PREVIEW_API_TARGET || "http://localhost:8005", changeOrigin: true }));
};

// Use the normal admin login for explicitly enabled loopback demos.
function serveLocalAdminLogin(app, parseEnv, { core, port }) {
  let pending = false;
  app.post("/_local/admin-login", async (req, res) => {
    res.set("Cache-Control", "no-store");
    if (!sameOriginDemoRequest(req, port, "x-hometruth-local-admin")) return res.sendStatus(403);
    if (pending) return res.status(409).json({ message: "An admin login is already in progress." });

    pending = true;
    try {
      const localEnv = parseEnv(await readFile(process.env.HOMETRUTH_LOCAL_ADMIN_ENV_FILE));
      const email = localEnv.LOCAL_ADMIN_EMAIL;
      const password = localEnv.LOCAL_ADMIN_PASSWORD;
      if (!email || !password) throw new Error("Local admin credentials unavailable");
      const response = await fetch(core + "/api/auth/login", {
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
      return res.json({ data: { token: result.data.token, user: result.data.user } });
    } catch {
      return res.status(503).json({ message: "The local admin login is unavailable." });
    } finally {
      pending = false;
    }
  });
}

// The local demo opens the existing synthetic customer using the normal password check.
function serveLocalMayaLogin(app, { email, password, core, port }) {
  app.post("/_local/maya-login", async (req, res) => {
    res.set("Cache-Control", "no-store");
    if (!sameOriginDemoRequest(req, port, "x-hometruth-local-maya")) return res.sendStatus(403);

    try {
      const response = await fetch(core + "/api/auth/login", {
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
