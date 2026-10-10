import { IncomingMessage, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';

// Pipeline HTTP Express sungguhan tanpa membuka port; aman untuk sandbox tanpa socket.
export function requestApp(app, path, options = {}) {
  return new Promise((resolve, reject) => {
    const output = [];
    const socket = new Duplex({
      read() {},
      write(chunk, encoding, callback) { output.push(Buffer.from(chunk)); callback(); },
    });
    socket.remoteAddress = '127.0.0.1';
    const req = new IncomingMessage(socket);
    req.method = options.method || 'GET';
    req.url = path;
    req.httpVersion = '1.1'; req.httpVersionMajor = 1; req.httpVersionMinor = 1;
    req.headers = { host: 'localhost', ...Object.fromEntries(Object.entries(options.headers || {}).map(([k, v]) => [k.toLowerCase(), v])) };
    const body = options.body ? Buffer.from(options.body) : null;
    if (body) req.headers['content-length'] = String(body.length);
    const res = new ServerResponse(req);
    res.assignSocket(socket);
    const timeout = setTimeout(() => reject(new Error('HTTP pipeline timeout')), 5000);
    res.on('error', reject);
    res.on('finish', () => {
      clearTimeout(timeout);
      const raw = Buffer.concat(output);
      const split = raw.indexOf('\r\n\r\n');
      if (split < 0) return reject(new Error('Invalid HTTP response'));
      const lines = raw.subarray(0, split).toString().split('\r\n');
      const status = Number(lines.shift().split(' ')[1]);
      const headers = new Headers();
      for (const line of lines) {
        const colon = line.indexOf(':');
        if (colon > 0) headers.append(line.slice(0, colon), line.slice(colon + 1).trim());
      }
      resolve(new Response(raw.subarray(split + 4), { status, headers }));
      socket.destroy();
    });
    app(req, res);
    if (body) req.push(body);
    req.complete = true;
    req.push(null);
  });
}
