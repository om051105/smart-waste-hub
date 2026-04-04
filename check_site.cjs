const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));

  await page.goto('https://om051105.github.io/smart-waste-hub/', { waitUntil: 'networkidle' });
  
  const content = await page.content();
  console.log("Root content:", await page.innerHTML('#root'));
  
  await browser.close();
})();
