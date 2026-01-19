const localtunnel = require('localtunnel');
const qrcode = require('qrcode-terminal');

console.log('\nđźŚ Creating LocalTunnel...\n');

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
    console.log('\n================================================');
    console.log('   SCAN THIS QR CODE:');
    console.log('================================================\n');

    qrcode.generate(expoUrl, { small: true }, (qr) => {
      console.log(qr);
    });

    console.log('\n================================================');
    console.log('đź“± Scan with Expo Go app!');
    console.log('âš ď¸Ź  Keep this window open!');
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
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  console.log('\nđź‘‹ Stopping...\n');
  process.exit();
});
