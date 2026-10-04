#!/bin/sh
node << 'EOF'
const dns = require('dns');
const fs = require('fs');
const { spawn } = require('child_process');

function startServer() {
    spawn('node', ['/app/server.js'], { stdio: 'inherit' }).on('exit', process.exit);
}

function applyPatch(addr) {
    let h = fs.readFileSync('/etc/hosts', 'utf8');
    h = h.replace(/^127\.0\.0\.1(\t| )/mg, addr + '\t');
    h = h.replace(/^::1(\t| )localhost(\t| )/mg, '::1\t');
    fs.writeFileSync('/etc/hosts', h);
}

function waitAndPatch(attempts) {
    dns.lookup('gateway', (err, addr) => {
        if (err || !addr) {
            if (attempts > 0) {
                setTimeout(() => waitAndPatch(attempts - 1), 2000);
            } else {
                startServer();
            }
            return;
        }
        applyPatch(addr);
        setTimeout(startServer, 500);
    });
}

waitAndPatch(30);
EOF
