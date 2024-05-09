const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require("express");

const { createProxyMiddleware } = require("http-proxy-middleware");

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const target = 'http://129.146.42.87:8080/api';
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = express();
    // apply proxy in dev mode
    if (dev) {
        server.use(
            "/api",
            createProxyMiddleware({
                target: target,
                changeOrigin: true
            })
        );
    }
    server.all("*", (req, res) => {
        return handle(req, res);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
    })
}).catch((err) => { console.log("Error", err); });