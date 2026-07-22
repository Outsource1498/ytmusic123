#!/usr/bin/env node

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const outDir = path.join(__dirname, 'providers');

const EXTERNAL_MODULES = [
    'cheerio-without-node-native',
    'react-native-cheerio',
    'cheerio',
    'crypto-js',
    'axios'
];

async function buildProvider(providerName) {
    const providerDir = path.join(srcDir, providerName);
    const entryPoint = path.join(providerDir, 'index.js');
    const outFile = path.join(outDir, providerName + '.js');

    if (!fs.existsSync(entryPoint)) {
        console.error('No entry point found at ' + entryPoint);
        return false;
    }

    try {
        await esbuild.build({
            entryPoints: [entryPoint],
            bundle: true,
            outfile: outFile,
            format: 'cjs',
            platform: 'neutral',
            target: 'es2016',
            minify: false,
            sourcemap: false,
            external: EXTERNAL_MODULES,
            banner: {
                js: '/**\n * ' + providerName + ' - Built from src/' + providerName + '/\n * Generated: ' + new Date().toISOString() + '\n */'
            },
            logLevel: 'warning'
        });

        const stats = fs.statSync(outFile);
        console.log('Built ' + providerName + '.js (' + (stats.size / 1024).toFixed(1) + ' KB)');
        return true;
    } catch (err) {
        console.error('Failed to build ' + providerName + ':', err.message);
        return false;
    }
}

async function main() {
    const providers = fs.readdirSync(srcDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    if (providers.length === 0) {
        console.log('No providers found in src/');
        return;
    }

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const provider of providers) {
        await buildProvider(provider);
    }
}

main().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
