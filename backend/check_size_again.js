const https = require('https');

const url = 'https://punjabi-kitchen27june.onrender.com/uploads/Paneer_Chilly.jpeg';

https.get(url, (res) => {
  console.log(`Content-Length: ${res.headers['content-length']}`);
  if (res.headers['content-length'] === '47095') {
    console.log('SUCCESS: Deployed rectified image is live on Render!');
  } else {
    console.log('STILL SERVNG OLD VERSION:', res.headers['content-length']);
  }
}).on('error', (err) => {
  console.error(err);
});
