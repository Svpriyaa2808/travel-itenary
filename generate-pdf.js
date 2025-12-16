/**
 * PDF Generation Script
 *
 * This script converts the HTML report to PDF using Puppeteer.
 *
 * Usage:
 *   1. Install puppeteer: npm install --save-dev puppeteer
 *   2. Run: node generate-pdf.js
 */

const fs = require('fs');
const path = require('path');

const htmlFile = 'AI_AGENT_PROJECT_REPORT.html';
const outputFile = 'Motorcycle_Shop_AI_Agent_Report.pdf';

// Check if puppeteer is installed
try {
  const puppeteer = require('puppeteer');

  (async () => {
    console.log('🚀 Starting PDF generation...');

    // Launch browser
    console.log('📦 Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load HTML file
    console.log('📄 Loading HTML file...');
    const htmlPath = path.join(__dirname, htmlFile);

    if (!fs.existsSync(htmlPath)) {
      console.error(`❌ Error: ${htmlFile} not found!`);
      await browser.close();
      process.exit(1);
    }

    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    console.log('📝 Generating PDF...');
    await page.pdf({
      path: outputFile,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    });

    await browser.close();

    console.log('✅ PDF generated successfully!');
    console.log(`📁 Output: ${outputFile}`);
    console.log(`📊 Size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);

  })();

} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('⚠️  Puppeteer not installed.');
    console.log('');
    console.log('To use this script, install puppeteer:');
    console.log('  npm install --save-dev puppeteer');
    console.log('');
    console.log('Or generate PDF manually:');
    console.log(`  1. Open ${htmlFile} in your browser`);
    console.log('  2. Press Ctrl+P (or Cmd+P on Mac)');
    console.log('  3. Select "Save as PDF"');
    console.log('  4. Save the file');
    console.log('');
    console.log('See GENERATE_PDF.md for detailed instructions.');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}
