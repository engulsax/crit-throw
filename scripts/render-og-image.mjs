import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const html = resolve(here, "og-frame.html");
const out = resolve(here, "../public/og-image.png");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file:///${html.replace(/\\/g, "/")}`);
await page.screenshot({ path: out, type: "png" });
await browser.close();
console.log("Wrote", out);
