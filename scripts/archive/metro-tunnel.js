const localtunnel = require('localtunnel');
const qrcode = require('qrcode-terminal');

console.log('Creating LocalTunnel...\n');

(async () => {
  try {
    const tunnel = await localtunnel({ 
      port: 8081,
      subdomain: 'expo-miliony-' + Math.random().toString(36).substring(7)
    });

    const tunnelUrl = tunnel.url;
    const expoUrl = tunnelUrl.replace('https://', 'exp://').replace('http://', 'exp://');
    
    console.log('âś… Tunnel created!');
    console.log('đźŚ URL: ' + tunnelUrl);
    console.log('đź“± Expo URL: ' + expoUrl);
    
    // Test tunnel
    console.log('\nTesting tunnel connection...');
    const http = require('http');
    const https = require('https');
    const protocol = tunnelUrl.startsWith('https') ? https : http;
    
    protocol.get(tunnelUrl + '/status', (res) => {
      if (res.statusCode === 200) {
        console.log('âś… Tunnel is forwarding correctly!\n');
      } else {
        console.log('âš ď¸Ź  Tunnel returned status: ' + res.statusCode + '\n');
      }
    }).on('error', (err) => {
      console.log('âš ď¸Ź  Tunnel test failed: ' + err.message + '\n');
    });

    console.log('================================================');
    console.log('   SCAN THIS QR CODE:');
    console.log('================================================\n');

    qrcode.generate(expoUrl, { small: true }, (qr) => {
      console.log(qr);
    });

    console.log('\n================================================');
    console.log('đź“± Scan with Expo Go app!');
    console.log('âš ď¸Ź  Keep BOTH windows open:');
    console.log('   - Metro Bundler (running in background)');
    console.log('   - This tunnel window');
    console.log('\nPress Ctrl+C to stop\n');

    tunnel.on('close', () => {
      console.log('\nTunnel closed');
      process.exit();
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
    });

  } catch (err) {
    console.error('Failed to create tunnel:', err.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Check if Norton is blocking localtunnel.me');
    console.log('  2. Try disabling Norton temporarily');
    console.log('  3. Or use localhost mode instead\n');
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  console.log('\n\nđź‘‹ Stopping...\n');
  process.exit();
});
