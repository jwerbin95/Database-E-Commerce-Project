<h1>Backend For The E-Commerce Project</h1>

<p>Author: Jacob Werbin</p>

<p>This project serves as a backend for the E-Commerce React App I will be developing. It is responsible for storing user related data: Usernames, Passwords, Credit Card Numbers, Addresses, Phone Numbers, and Email Addresses.  This database will also store the products currently in stock and their price to compensate for any price changes.</p>

<p>Currently the database is queried using psql (specifically ps from npm) and javascript. In its current state, a very crude login system has been implemented with the option to edit user data and create new users. Also implemented is the option to add new companies/products related to those companies.</p>

<p>Implemented adding/removing items from a users cart and displaying user information within their profile page.</p>

<p>Server will log to the server_log file using morgan and currently runs on port 3000. Wireframe built using Pencil.</p>

<p>Instead of running a client-app like Axios or node-fetch, I decided to user EJS views to display CRUD operations.</p>