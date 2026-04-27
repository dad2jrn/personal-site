import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generatePDF() {
  console.log('Starting Astro dev server...');
  const astro = spawn('npx', ['astro', 'dev', '--port', '4321'], {
    stdio: 'inherit',
    shell: true
  });

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to resume page...');
  await page.goto('http://localhost:4321/resume', {
    waitUntil: 'networkidle'
  });

  // Hide theme toggle and nav for PDF
  await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    const themeToggle = document.querySelector('button');
    const pdfButton = document.querySelector('a[href="/resume.pdf"]')?.parentElement;

    if (nav) nav.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (themeToggle) themeToggle.style.display = 'none';
    if (pdfButton) pdfButton.style.display = 'none';
  });

  console.log('Generating PDF...');
  await page.pdf({
    path: path.join(__dirname, '../public/resume.pdf'),
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });

  console.log('PDF generated successfully at public/resume.pdf');

  await browser.close();
  astro.kill();
  process.exit(0);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});