require('dotenv').config();
const { chromium } = require('@playwright/test');
const AuthHelperV2 = require('./utils/auth-helper-v2');

async function debugSelectors() {
  let browser = null;
  let context = null;
  let page = null;

  try {
    console.log('\n🔍 DEBUGGING SELECTORS FOR FAILED TESTS\n');

    browser = await chromium.launch({ headless: false });
    context = await browser.newContext({ ignoreHTTPSErrors: true });
    page = await context.newPage();

    console.log('🔐 Authenticating...');
    const authHelper = new AuthHelperV2();
    await authHelper.authenticate(page, false);
    console.log('✅ Authenticated\n');
    
    await page.waitForTimeout(2000);

    // DEBUG: Check Sidebar
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DEBUG 1: Finding Sidebar');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sidebarSelectors = [
      'aside',
      '[role="navigation"]',
      '.sidebar',
      'nav',
      '[class*="sidebar"]',
      '[class*="nav"]',
      '.left-sidebar',
      '[class*="side"]'
    ];
    
    for (const sel of sidebarSelectors) {
      try {
        const elem = await page.locator(sel).first();
        const isVisible = await elem.isVisible({ timeout: 1000 }).catch(() => false);
        console.log(`Selector: "${sel}" → ${isVisible ? '✅ FOUND' : '❌ not found'}`);
        if (isVisible) {
          const box = await elem.boundingBox();
          console.log(`  Position: ${JSON.stringify(box)}`);
        }
      } catch (e) {}
    }

    // DEBUG: Check Recent Target
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DEBUG 2: Finding "Recent Target" Widget');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const pageContent = await page.content();
    if (pageContent.includes('Recent Target')) {
      console.log('✅ "Recent Target" text FOUND in page HTML');
    } else {
      console.log('❌ "Recent Target" text NOT found in page HTML');
    }
    
    const targetSelectors = [
      'text=Recent Target',
      'text=/Recent Target/i',
      '[class*="target"]',
      ':has-text("Recent Target")',
      'div:has-text("Recent Target")'
    ];
    
    for (const sel of targetSelectors) {
      try {
        const elems = await page.locator(sel).all();
        if (elems.length > 0) {
          console.log(`Selector: "${sel}" → ✅ Found ${elems.length} element(s)`);
          for (let i = 0; i < Math.min(2, elems.length); i++) {
            const text = await elems[i].textContent();
            console.log(`  [${i}] Text: "${text}"`);
          }
        }
      } catch (e) {
        console.log(`Selector: "${sel}" → ❌ Error: ${e.message}`);
      }
    }

    // DEBUG: Check Recent To Dos
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DEBUG 3: Finding "Recent To Dos" or "Recent To-Dos"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (pageContent.includes('Recent To Dos') || pageContent.includes('Recent To-Dos')) {
      console.log('✅ Text variations FOUND in page HTML');
    } else {
      console.log('❌ Text not found - searching for similar...');
    }
    
    const todoSelectors = [
      'text=Recent To Dos',
      'text=/Recent To.?Dos/i',
      'text=/Recent.*[Tt]o.*[Dd]os/i',
      '[class*="todo"]',
      'div:has-text("Recent")'
    ];
    
    for (const sel of todoSelectors) {
      try {
        const elems = await page.locator(sel).all();
        if (elems.length > 0) {
          console.log(`Selector: "${sel}" → ✅ Found ${elems.length} element(s)`);
          for (let i = 0; i < Math.min(2, elems.length); i++) {
            const text = await elems[i].textContent();
            console.log(`  [${i}] Text: "${text}"`);
          }
        }
      } catch (e) {}
    }

    // DEBUG: List all visible text on page
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DEBUG 4: All Widget Headings on Dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allText = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, div[class*="title"], div[class*="heading"]'));
      return headings.map(h => h.textContent.trim()).filter(t => t.length > 0 && t.length < 100);
    });
    
    console.log('Found headings/titles:');
    allText.forEach((text, i) => console.log(`  ${i+1}. "${text}"`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugSelectors().catch(console.error);
