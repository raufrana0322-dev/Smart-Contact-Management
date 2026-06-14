# Smart Contact Management System

**Course Project - Web Technologies SP26**  
**BSCS 4th Semester · Sections 2M**  
**Student Name:** Abdul Rauf
**Roll Number:** F24BDOCS1M01327 

---

## 1. Project Overview

The **Smart Contact Management System** is a lightweight, responsive, and dynamic web application designed to help individuals organize, search, filter, and manage their social and professional connections. 

The application utilizes a **plain HTML5, custom CSS3, and vanilla JavaScript** frontend connected to a local mock REST API backend powered by **JSON Server**. It contains two separate dashboards:
1. **User Panel (`index.html`)**: Focuses on viewing, filtering, searching, and creating contact records.
2. **Admin Panel (`admin.html`)**: Focuses on advanced analytics, updating contact details, and deleting resource entries.

---

## 2. Technology Stack

*   **Markup**: HTML5 (semantic, accessible structure including `<nav>`, `<main>`, `<header>`, `<article>`, `<form>`).
*   **Styling**: Custom CSS3 (flexible variables, glassmorphic touches, responsive grid/flexbox, custom interactive states). *No external frameworks like Bootstrap or Tailwind CSS were used.*
*   **JavaScript**: Plain ES6+ JavaScript ONLY. No jQuery, React, Vue, or Angular.
*   **Backend Database**: JSON Server (local mock REST API serving `db.json` via port `3000`).
*   **Data format**: JSON accessed asynchronously using the browser `fetch` API.

---

## 3. Core Features List

### 3.1 User Panel (`index.html` & `app.js`)
*   **GET Read & Render**: Retreives all contacts with status `Active` from JSON Server and prints them using CSS cards.
*   **Category Tabs filtering**: Quick client-side category filters ("All", "Work", "Personal", "Family", "Other").
*   **Debounced Search Input (Bonus Feature)**: A search bar filtering contacts by name, email, or company. Input is throttled by a custom `debounce` timer (300ms delay) to prevent redundant queries to the server.
*   **Light/Dark Theme Selector**: A theme toggle button that flips the layout styling and stores user choice inside `localStorage` for cross-page persistence.
*   **POST Create Form**: A slide-out creation overlay containing **6 input fields** (Name, Email, Phone, Category, Company, Notes).
*   **Inline HTML Form Validation**: Check email pattern match, telephone formats (digits and symbols, min 10), select index selection, and text lengths with custom red warnings beneath input slots (no raw browser `alert()` popups).
*   **Loading & Connection Error Indicators**: Showing glowing skeleton loaders during data fetch and a custom reconnection banner if JSON Server is offline.

### 3.2 Admin Panel (`admin.html` & `admin.js`)
*   **Admin Identification**: Visual contrast from the user site, using different themed colors (warm amber/brown navigation borders) and clear administrative labels.
*   **Advanced Analytics (3 Summary Statistics)**:
    1.  *Total Contacts count* (Active and Archived combined).
    2.  *Active vs. Archived Ratio* (shows records status breakdown).
    3.  *Category Distribution* (percentage progress bars displaying weight of Work, Personal, Family, and Other contacts).
*   **CRUD Data Table**: Renders all contacts in a responsive list, highlighting contact information, categories, and active statuses.
*   **PUT Update Form Modal**: Edit buttons open an edit form populated with current fields, saving adjustments via `PUT` request while retaining the original timestamp metadata.
*   **DELETE Resource flow**: Clicking delete launches a standard confirmation dialogue. If approved, sends a `DELETE` request to prune the entry.

---

## 4. Setup and Installation Steps

To deploy and execute the application locally, follow these steps:

### Step 1: Install Node.js
Ensure you have Node.js installed on your computer. You can check this by typing in your command prompt:
```bash
node -v
```

### Step 2: Set Up JSON Server
Since JSON Server is mandatory for the database, install it globally via npm (if you haven't already):
```bash
npm install -g json-server
```
Alternatively, you can run it directly using `npx`.

### Step 3: Run the Mock API
Navigate to your project directory in your terminal and start JSON Server to watch your `db.json` file on port `3000`:
```bash
npx json-server --watch db.json --port 3000
```
Verify that the API is running by loading `http://localhost:3000/contacts` in your browser.

### Step 4: Open the Application
Double-click `index.html` to open the User Panel in your browser, or run it through a local development server extension (like VS Code Live Server). 

---

## 5. Viva Study Guide (Important Concept Summaries)

Use this section to prepare for the 10-minute viva interview with your instructor.

### Q1: What does `e.preventDefault()` do, and why is it needed inside form submission handlers?
**Answer**: By default, standard web browsers reload the webpage when a `<form>` is submitted. `e.preventDefault()` halts this default behavior. In modern single-page designs or AJAX layouts, we call it to allow JavaScript to handle validation, pull input values, and make asynchronous API requests behind the scenes without losing the page state.

### Q2: Explain the Event Loop and why `setTimeout(cb, 0)` does not execute immediately.
**Answer**: JavaScript is single-threaded; it executes synchronous code in the Call Stack. Asynchronous tasks (like fetch, timers) are handed to Web APIs. Once completed, their callbacks enter the Callback Queue.
The **Event Loop** constantly monitors the Call Stack and the Callback Queue. It only pushes callbacks from the queue onto the stack *after the Call Stack is completely empty*. Thus, `setTimeout(cb, 0)` puts the callback on the queue immediately, but it waits until all current synchronous script blocks finish executing before running.

### Q3: What is the difference between PUT and PATCH?
**Answer**: 
*   **PUT**: Replaces the entire resource on the server. You must send a full representation of the object; missing fields will either be wiped out or set to null/defaults.
*   **PATCH**: Performs partial updates. You only send the specific attributes you want to modify, leaving other values on the resource untouched.

### Q4: Why do we need `JSON.stringify()` before sending a POST/PUT request?
**Answer**: HTTP requests transmit data as raw strings or byte arrays. JavaScript objects cannot be sent directly over wire protocol. We use `JSON.stringify(obj)` to serialize our JavaScript object into a formatted JSON string, matching the header `'Content-Type': 'application/json'` so the backend server understands the body data.

### Q5: If a fetch returns a 404 status code, will it throw an error in the catch block? How do we handle it?
**Answer**: **No.** The `fetch` API only rejects the promise (throws a network failure) if there is an actual connection interruption or DNS failure. A HTTP status code error like 404 (Not Found) or 500 (Internal Server Error) counts as a completed exchange. We handle it by checking the `response.ok` property (which is true for status codes 200-299) and manualy raising an error if it is false:
```javascript
if (!response.ok) {
  throw new Error(`HTTP Error! Status: ${response.status}`);
}
```

### Q6: Why is `response.json()` called with parentheses, and what does it return?
**Answer**: It is called with parentheses because it is a method. It returns a **Promise** because parsing stream contents into a structured JavaScript object takes time. We must use `await response.json()` to pause execution until the parsing is complete and retrieve the parsed data.

### Q7: What is debouncing, and how does it work in your search bar?
**Answer**: Debouncing is a performance optimization. It merges multiple closely spaced events into a single call. In our search bar, a user typing "rauf" triggers four keyboard inputs. Instead of sending four fetch queries, `debounce` starts a timer of 300ms on keypress. If another key is typed before 300ms, the previous timer is cleared. The search execution is only dispatched when the user stops typing for at least 300ms, reducing backend traffic.
