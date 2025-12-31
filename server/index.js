import path from 'path'
import { fileURLToPath } from 'url';
import express from 'express'
const app = express();

import http from 'http'
const server = new http.Server(app);

import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(server);

import jsdom from 'jsdom'
const { JSDOM } = jsdom;


const PORT = 5173;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname + '/client/dist/'));

// Allow express to parse JSON bodies
app.use(express.json());

//discord OAUTH
app.post("/api/token", async (req, res) => {
  
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({access_token});
});


// Serve game-specific assets from `/game/*`
const distDir = path.join(__dirname, 'client/dist');
const gameAssetsDir = path.join(__dirname, 'client/game/assets');

app.use('/phaserAssets', express.static(gameAssetsDir));

// Serve the distributed site from the dist directory
//app.use(express.static(distDir));

app.get('/', function (req, res) {
  console.log(__dirname);
  res.sendFile(path.join(distDir, 'index.html'));
});

// SPA fallback: for any non-/game/* path, return dist index.html
// app.get('*', (req, res) => {
//   if (req.path.startsWith('/game/')) {
//     // If a /game/* file wasn't found by the static middleware, return 404
//     return res.status(404).send('Not found');
//   }
//   res.sendFile(path.join(distDir, 'index.html'));
// });


function setupAuthoritativePhaser() {
  const { VirtualConsole } = jsdom;
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('log', (...args) => console.log('[jsdom log]', ...args));
  virtualConsole.on('info', (...args) => console.info('[jsdom info]', ...args));
  virtualConsole.on('warn', (...args) => console.warn('[jsdom warn]', ...args));
  virtualConsole.on('error', (...args) => console.error('[jsdom error]', ...args));

  JSDOM.fromFile(path.join(__dirname, 'authoritative_server/index.html'), {
    // To run the scripts in the html file
    runScripts: "dangerously",
    // Also load supported external resources
    resources: "usable",
    // So requestAnimatinFrame events fire
    pretendToBeVisual: true,
    virtualConsole
  }).then((dom) => {
    dom.window.gameLoaded = () => {
      server.listen(PORT, function () {
        console.log(`Listening on ${PORT}`);
      });
    };
    dom.window.io = io;
  }).catch((error) => {
    console.log(error.message);
  });
}
setupAuthoritativePhaser();