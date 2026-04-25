import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        // Browser Launch Settings
        const browser = await puppeteer.launch({
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
        });

        const page = await browser.newPage();
        
        // Viewport size (Desktop View)
        await page.setViewport({ width: 1280, height: 720 });

        // Website par jana
        await page.goto(decodeURIComponent(url), { waitUntil: 'networkidle0' });

        // Screenshot lena
        const screenshot = await page.screenshot({ type: 'png' });

        await browser.close();

        // Image return karna
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 's-maxage=3600'); // 1 ghante tak cache rahega
        return res.send(screenshot);

    } catch (error) {
        return res.status(500).json({ error: 'Screenshot failed: ' + error.message });
    }
}
