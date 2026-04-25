import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';

export default async function handler(req, res) {
    const { url, fullPage } = req.query;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const browser = await puppeteer.launch({
            args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Premium Viewport
        await page.setViewport({ width: 1280, height: 800 });

        // Website Load Karna
        await page.goto(decodeURIComponent(url), { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
        });

        // Screenshot Logic
        const screenshot = await page.screenshot({ 
            type: 'png',
            fullPage: fullPage === 'true' // Agar query mein fullPage=true ho
        });

        await browser.close();

        // Response Headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
        return res.send(screenshot);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Screenshot Failed: ' + error.message });
    }
}
