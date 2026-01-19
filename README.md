# Igluski-Playwright-ts
End-to-end QA project including automated tests for search and booking flows on IgluSki's demo holiday website using Playwright + TypeScript.

🏔️ **Automated QA Project – IgluSki Holiday**
This repository presents an end-to-end QA case study based on the holiday booking website **IgluSki**:  
🔗 [https://www.igluski.com/](https://www.igluski.com/)

---

## 🎯 Purpose
Demonstrate the ability to plan, organize, and execute **automated end-to-end tests** for a holiday booking platform, following professional QA practices with Playwright and TypeScript.

---

## 📋 Activities Performed
✅ Implemented Page Object Model (POM) for maintainable automation  
🧠 Defined test scenarios for the main user flows (search, filter, results, booking)  
🧾 Wrote automated test cases covering both positive and boundary scenarios  
🔍 Executed tests with screenshots and HTML reports  
🐞 Validated core functionality without performing real purchases (production environment)  
📄 Structured documentation for technical and non-technical readers

---

## 🧪 Test Coverage
- Homepage loading and UI elements validation  
- Search for holidays by destination, dates, and number of guests  
- Apply filters (price range, resort, ratings)  
- Results page validation and navigation  
- Holiday detail page validation  
- Start booking process without finalizing payment  

---

## 🧰 Tools Used
- **Playwright** – test automation framework  
- **TypeScript** – typed scripting for maintainability  
- Node.js – project runtime  
- HTML reports (Playwright Test Reporter)  
- Screenshots for test evidence  

---

## 📁 Repository Structure
```
├── tests/ # End-to-end test scripts
│ ├── search.spec.ts
│ ├── filters.spec.ts
│ ├── booking.spec.ts
├── pages/ # Page Objects
│ ├── home.page.ts
│ ├── search.page.ts
│ ├── results.page.ts
│ ├── holiday.page.ts
├── playwright.config.ts # Playwright configuration
├── package.json # Node.js project dependencies
├── tsconfig.json # TypeScript configuration
└── README.md # Project documentation
```
---

## ▶️ How to Run the Tests

1. Clone the repository:
git clone https://github.com/gabrielsouza80/igluski-playwright-ts
 cd igluski-playwright-ts

2. Install dependencies:
npm install

3. Install browsers:
npx playwright install

4. Run all tests:
```bash
npx playwright test
```

5. Run tests with UI:
```bash
npx playwright test --ui
```

6. Show HTML report:
```bash
npx playwright show-report
```

---

## 🧾 Generate a single-file Allure report
If you want a single self-contained HTML file with the Allure report (handy to attach to issues), you can use the included helper script.

1. Produce the Allure HTML report (this writes `allure-report/`):
```bash
npm run allure:generate
```

2. Create a single-file HTML (`allure-report-single.html`) by inlining CSS/JS/assets:
```bash
npm run allure:single
```

3. Open the single file in your browser:
```bash
start allure-report-single.html    # Windows (PowerShell/CMD)
open allure-report-single.html     # macOS
xdg-open allure-report-single.html # Linux
```

---

## 🧾 Optional: Allure Report
This project also supports generating an Allure report from Playwright results.

1. Install the dev dependencies (already added to package.json):
```bash
npm install
```

2. Run tests while producing Allure results:
```bash
npx playwright test --reporter=allure-playwright
```

3. Generate the Allure report (output folder `allure-report`):
```bash
npx allure generate allure-results --clean -o allure-report
```

4. Open the generated report in your browser:
```bash
npx allure open allure-report
```

You can also use the included npm scripts:
- `npm run test:allure` — run tests with Allure reporter and HTML reporter
- `npm run allure:generate` — generate the report
- `npm run allure:open` — open the report

---

## 🔄 Page Variants Support
**Important:** The search page has **two different layout variants** (A and B) that can appear randomly in both desktop and mobile views. This is common in websites using A/B testing or feature flags.

### How the Tests Handle Variants
- The `SearchPage` class automatically **detects which variant** is loaded on each test run
- Detection happens before critical operations (filters, results validation)
- Tests use **adaptive selectors** that work with both variants
- Variant detection is logged in the console: `🔍 Page variant detected: A (classic layout)` or `🔍 Page variant detected: B (alternative layout)`

### If Tests Fail Intermittently
If you see intermittent failures where tests pass sometimes and fail others, it may be due to:
1. **Different variants loading** on different test runs
2. **Missing selectors** for variant B that only exist in variant A

**Solution:** Check the test logs to see which variant was detected, then update the selectors in `pages/search.page.ts` to support both variants.

---

👤 Author
Gabriel Souza – QA Automation Engineer
Technologies: Playwright · TypeScript · Node.js · End-to-End Automation
