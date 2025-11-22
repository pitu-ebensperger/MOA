async function main() {
  try {
    const res = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@moa.cl', password: 'admin123' })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log(text);
  } catch (e) {
    if (e?.cause?.code === 'ECONNREFUSED') {
      console.error('Login request failed: backend is not reachable on http://localhost:4000. Did you start `npm run -w backend dev`?');
    } else {
      console.error('Login request failed:', e);
    }
    process.exitCode = 1;
  }
}

main();
