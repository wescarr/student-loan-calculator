# Student Loan Calculator

The Goal of this project is to replicate and enhance the functionality provided by the Department of Education's student loan calculator: https://studentloans.gov/myDirectLoan/repaymentEstimator.action

It has the following major limitations:
- Assumes all loans are new and that no balance has been paid
- Confusing to use and does not make certain stipulations clear (eg: Parent Plus can qualify for IBR if consolidated)
- Assumes 5% AGI increase every year. Should be adjustable
- Does not properly account for various government subsidies.

Additionally the current tool:
- Does not recommend the best program for a brower based on time period and monthly spending goals
- Offers no helpful visualization
- Can be confusing to use to borrower's unfamilar with the details of student loans.

The nitty gritty of how all these programs work is mostly captured here:
https://drive.google.com/drive/folders/11vuc6_gN_nULvqU6xMUUtHARifGuENnm?usp=sharing

## Setup and local development

The calculator is built on the Next.js framework on deployed on [Vercel](https://vercel.com)
You will need to [install Node.js](https://nodejs.org) and then run the following:

```bash
npm install
npm run dev
```

This will launch the local development server on http://localhost:3000
