const { chromium } = require('playwright');
const SessionManager = require('../utils/session-manager');

async function debugScroll() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const sessionManager = new SessionManager();

  try {
    // Restore session
    const session = await sessionManager.loadSession();
    if (session && sessionManager.isSessionValid(session)) {
      await sessionManager.restoreSession(context, session);
      await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    console.log('=== Scroll Debug ===');
    
    // Get scroll info
    const scrollInfo = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollTop: window.scrollY,
      canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      bodyScrollHeight: document.body.scrollHeight,
      bodyClientHeight: document.body.clientHeight
    }));

    console.log('Document Height:', scrollInfo.scrollHeight);
    console.log('Body Height:', scrollInfo.bodyScrollHeight);
    console.log('Viewport Height:', scrollInfo.clientHeight);
    console.log('Current Scroll:', scrollInfo.scrollTop);
    console.log('Can Scroll:', scrollInfo.canScroll);

    if (scrollInfo.canScroll) {
      console.log('\n→ Scrolling down 500px...');
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);

      const newScroll = await page.evaluate(() => window.scrollY);
      console.log('New Scroll Position:', newScroll);

      console.log('\n→ Scrolling down 500px more...');
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);

      const finalScroll = await page.evaluate(() => window.scrollY);
      console.log('Final Scroll Position:', finalScroll);

      console.log('\n→ Scrolling back to top...');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);

      const topScroll = await page.evaluate(() => window.scrollY);
      console.log('Back to Top Position:', topScroll);
    } else {
      console.log('\n⚠️ Dashboard does not have scrollable content');
      console.log('This is expected if the layout is fixed or uses overflow:hidden');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugScroll();
