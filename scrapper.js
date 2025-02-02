require('dotenv').config();
const { chromium } = require('playwright'); // Use Playwright's chromium


async function loginToCUCHD() {
    const browser = await chromium.launch({
      headless: false, // Set to false to see the browser UI (helpful for debugging)
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--remote-debugging-port=9223',
      ],
    });
  
    const page = await browser.newPage();
  
    try {
      // Step 1: Navigate to the CUCHD login page
      await page.goto('https://students.cuchd.in/', { waitUntil: 'networkidle' });
      console.log('Navigated to:', page.url()); // Debug: Check the URL after navigation
  
      // Step 2: Wait for the username field, then fill in the username and click "Next"
      await page.waitForSelector('#txtUserId', { visible: true, timeout: 60000 }); // Wait for the username input field
      await page.fill('#txtUserId', process.env.CUCHD_USERNAME);
      await page.click('#btnNext');
      console.log('Current URL after username submission:', page.url());
  
      // Wait for the login page to load after username submission
      await page.waitForLoadState('load');
      
      // Step 3: Fill in the password and wait for captcha
      await page.waitForSelector('#txtLoginPassword', { visible: true });
      await page.fill('#txtLoginPassword', process.env.CUCHD_PASSWORD);
      console.log('Password entered');
  
      // Step 4: Get captcha image URL
      const captchaImageUrl = await page.$eval('#imgCaptcha', (img) => img.src);
      console.log('Captcha Image URL:', captchaImageUrl);
  
      // Step 5: Manually solve the captcha
      const captchaText = await solveCaptchaManually(); // Prompt user to solve the captcha manually
      console.log('Manually Solved Captcha:', captchaText);
  
      // Step 6: Fill in the captcha solution and submit
      await page.fill('#txtcaptcha', captchaText);
      await page.click('#btnLogin');
      
      // Debug: Check if login button was clicked
      console.log('Submitting login form...');
      
      // Wait for the next page to load
      await page.waitForLoadState('networkidle');
  
      // Step 7: Check if login was successful
      const currentUrl = page.url();
        if (currentUrl === 'https://students.cuchd.in/StudentHome.aspx') {
        console.log('Successfully logged in and redirected to the Student Home page!');
        } else {
        throw new Error('Login failed: Invalid credentials or captcha.');
        }
        
      console.log('Login successful!');
  
      // Step 8: Navigate to the dashboard or another page
      await page.goto('https://students.cuchd.in/StudentHome.aspx', { waitUntil: 'networkidle' });
  
      // Step 9: Scrape or interact with the content on the page
      const dashboardContent = await page.content();
    //   console.log('Dashboard Content:', dashboardContent);
  
      // Step 10: Close the browser
      await browser.close();
    } catch (error) {
      console.error('Error during login or scraping:', error);
      await browser.close();
    }
  }
  
// Manually solve the captcha and input the text
async function solveCaptchaManually() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Please solve the captcha and enter the text here: ', (captchaText) => {
      resolve(captchaText);
      rl.close();
    });
  });
}

// Run the script
loginToCUCHD();
