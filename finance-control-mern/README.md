## 📋 Project Overview


### [Equilibrio Financeiro](https://equilibriofinanceiro.web.app/)
- **Description**: A multi-tenant financial control application where users can manage their finances, track income and expenses, and visualize data with charts and PDF exports. It integrates with Stripe for payments and includes user authentication Google.
- **Tech Stack**:  
  - MERN (MongoDB, Express, React, Node.js)  
  - Firebase (Frontend hosting)  
  - Stripe (for payment integration)  
  - Nodemailer (for reset password emails)
  - GIS (Google Identity Service)
 
- **Features**:  
  - 💰 Transaction tracking with tags  
  - 🔄 Recurring transactions  
  - 🔍 Efficient filtering options  
  - 📊 PDF export and chart visualization  
  - 🔑 Google Sign-In and one-tap authentication  
  - 📧 Password reset via email

- **Notes**:
- ***About search filter dates***:
    - All Date types from search filters or new transactions sent to the backend must be in "YYYY-MM-DD" format to be parsed into Date object.
    - Dates are saved in UTC at midnight (0:00) on server to make date filtering easier disregarding time created.
    - Displaying dates parsed with .toLocaleString() will show the day before if options 'timeZone: "UTC"' not specified, because browser will subtract -03:00 (brazilian local time) from 0:00Z (zulu time).
 
- ***Creating and Deleting transactions***:

    - Fetching transaction from server after creating and getting the mongoDb "_.id" is required to allow user to delete it right away if needed. Queries by "._id" are auto indexed by mongoDb and more performant.
    - In case of "styled_component" error in the console, rollback the MUI updates by downgrading the versions in package.json file to the ones below and run npm install:
    - Do not run "npm audit fix" command to avoid this error.

"dependencies": {
"@emotion/react": "^11.11.4",
"@emotion/styled": "^11.11.5",
"@mui/icons-material": "^5.16.0",
"@mui/lab": "^5.0.0-alpha.171",
"@mui/material": "^5.16.0",
}


