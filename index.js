const puppeteer = require('puppeteer');
const axios = require('axios');

(async () => {
  try {
    // 1. Récupération du texte depuis Make Webhook
    const response = await axios.get('https://hook.eu2.make.com/qf5gzsr6ghw9dvys5frcbz6x4uwa3kkm');
    const texte = response.data.texte || 'Texte de secours par défaut.';

    // 2. Lancement du navigateur
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 3. Aller sur All Voice Lab
    await page.goto('https://www.allvoicelab.com/workbench/tts', { waitUntil: 'domcontentloaded' });

    // 4. Attendre et cibler le champ de texte
    await page.waitForSelector("textarea");
    await page.click("textarea");
    await page.type("textarea", texte, { delay: 10 });

    // 5. Cliquer sur "Generate speech"
    await page.waitForSelector("button:text('Generate speech')", { timeout: 5000 }).catch(async () => {
      // fallback si le bouton ne fonctionne pas avec :text()
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text.trim().toLowerCase().includes('generate speech')) {
          await button.click();
          break;
        }
      }
    });

    // 6. Attendre que le son soit généré
    await page.waitForTimeout(10000);
    await browser.close();

    console.log('✅ Texte collé et audio généré sur All Voice Lab');

  } catch (error) {
    console.error('❌ Erreur :', error.message);
  }
})();
