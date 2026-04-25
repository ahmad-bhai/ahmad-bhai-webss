import chrome from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
    const { url, fullPage } = req.query;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        // Vercel par browser launch karne ka sab se stable tareeqa
        const options = {
            args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        };

        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1280, height: 800 });

        // Timeout ko thora kam rakha hai taake Vercel khud crash na kare
        await page.goto(decodeURIComponent(url), { 
            waitUntil: 'networkidle2', 
            timeout: 15000 
        });

        const screenshot = await page.screenshot({ 
            type: 'png',
            fullPage: fullPage === 'true'
        });

        await browser.close();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, s-maxage=3600');
        return res.send(screenshot);

    } catch (error) {
        console.error("Ahmad Bhai Error:", error.message);
        // Crash ke bajaye JSON error return karega taake debug ho sake
        return res.status(500).json({ 
            error: 'Capture Failed', 
            details: error.message 
        });
    }
}
