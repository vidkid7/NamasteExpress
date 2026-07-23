const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  const htmlPath = "file://" + path.resolve(__dirname, "admin-manual.html");
  const outPath = path.resolve(__dirname, "NamasteExpress-Admin-Manual.pdf");

  const systemBrowsers = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const executablePath = systemBrowsers.find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage();
  await page.goto(htmlPath, { waitUntil: "networkidle" });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px;width:100%;padding:0 14mm;color:#9ca3af;display:flex;justify-content:space-between;">
        <span>NamasteExpress — Admin Panel User Manual</span><span>नमस्ते एक्सप्रेस</span></div>`,
    footerTemplate: `<div style="font-size:8px;width:100%;padding:0 14mm;color:#9ca3af;text-align:center;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
    margin: { top: "20mm", bottom: "16mm", left: "0mm", right: "0mm" },
  });
  await browser.close();
  console.log("PDF written to:", outPath);
})();
