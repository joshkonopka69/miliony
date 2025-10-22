const localtunnel = require('localtunnel');
const qrcode = require('qrcode-terminal');

console.log('\nCreating tunnel...\n');

(async () => {
  try {
    const tunnel = await localtunnel({ 
      port: 8081,
      subdomain: 'expo-app-' + Math.random().toString(36).substring(7)
    });

    const tunnelUrl = tunnel.url;
    const expoUrl = tunnelUrl.replace('https://', 'exp://').replace('http://', 'exp://');
    
    console.log('âś… Tunnel URL: ' + tunnelUrl);
    console.log('đź“± Expo URL: ' + expoUrl);
    console.log('\n================================================');
    console.log('   SCAN THIS QR CODE WITH EXPO GO:');
    console.log('================================================\n');

    qrcode.generate(expoUrl, { small: true });

    console.log('\n================================================');
    console.log('âś… Ready! Scan the QR code with Expo Go');
    console.log('');
    console.log('âš ď¸Ź  IMPORTANT:');
    console.log('   - Keep both windows open (Metro + Tunnel)');
    console.log('   - First scan may take 30-60 seconds to load');
    console.log('   - Look at Metro window for download progress');
    console.log('');
    console.log('Press Ctrl+C to stop\n');

    tunnel.on('close', () => {
      console.log('\nTunnel closed');
      process.exit();
    });

  } catch (err) {
    console.error('\nâťŚ Tunnel error:', err.message);
    console.log('\nMost likely Norton is blocking localtunnel.me');
    console.log('Try: Disable Norton temporarily\n');
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  console.log('\nđź‘‹ Stopping...\n');
  process.exit();
});
