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
npx playwright test

5. Run tests with UI:
npx playwright test --ui

6. Show HTML report:
npx playwright show-report

👤 Author
Gabriel Souza – QA Automation Engineer
Technologies: Playwright · TypeScript · Node.js · End-to-End Automation
