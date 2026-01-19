const lt = require('localtunnel');
const qr = require('qrcode-terminal');

(async () => {
  try {
    const tunnel = await lt({ port: 8081 });
    const url = tunnel.url.replace('https://', 'exp://');
    
    console.log('âś… Tunnel created!');
    console.log('đźŚ URL: ' + tunnel.url);
    console.log('đź“± Expo URL: ' + url);
    console.log('');
    console.log('================================================');
    console.log('   SCAN THIS QR CODE:');
    console.log('================================================');
    console.log('');
    
    qr.generate(url, { small: true });
    
    console.log('');
    console.log('================================================');
    console.log('âś… Ready! Scan with Expo Go app');
    console.log('âš ď¸Ź  Keep this window open!');
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('');
    
    await new Promise(() => {});
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
})();
