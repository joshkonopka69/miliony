const localtunnel = require('localtunnel');
const qrcode = require('qrcode-terminal');

console.log('Creating tunnel...\n');

(async () => {
  try {
    const tunnel = await localtunnel({ 
      port: 8081,
      subdomain: 'expo-miliony-' + Math.random().toString(36).substring(7)
    });

    const tunnelUrl = tunnel.url;
    const expoUrl = tunnelUrl.replace('https://', 'exp://').replace('http://', 'exp://');
    
    console.log('âś… Tunnel created successfully!');
    console.log('đźŚ Tunnel URL: ' + tunnelUrl);
    console.log('đź“± Expo URL: ' + expoUrl);
    console.log('\n================================================');
    console.log('   SCAN THIS QR CODE WITH EXPO GO:');
    console.log('================================================\n');

    qrcode.generate(expoUrl, { small: true }, (qr) => {
      console.log(qr);
    });

    console.log('\n================================================');
    console.log('đź“± Instructions:');
    console.log('  1. Open Expo Go app on your phone');
    console.log('  2. Tap "Scan QR code"');
    console.log('  3. Scan the QR code above');
    console.log('  4. Wait 10-30 seconds for app to load');
    console.log('');
    console.log('âš ď¸Ź  IMPORTANT: Keep both windows open!');
    console.log('   - Metro Bundler window (for serving app)');
    console.log('   - This tunnel window (for QR code)');
    console.log('');
    console.log('Press Ctrl+C to stop tunnel\n');

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
    console.log('  1. Make sure Metro is running on port 8081');
    console.log('  2. Check if port 8081 is accessible');
    console.log('  3. Try again in a few seconds');
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  console.log('\n\nđź‘‹ Stopping tunnel...\n');
  process.exit();
});
