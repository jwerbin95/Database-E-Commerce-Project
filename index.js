const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');
const connectionString = 'postgresql://localhost:5432/E-Commerce';
const client = new Client({ connectionString });
const query =
	'INSERT INTO "User" (user_name, password, email, phone_number, credit_card_number, address) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';

const PORT = 3000;

let values = [];
let app = express();
let errorFlag = false;

client.connect();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/new_user', (request, response) => {
	response.render('main', { error: errorFlag });
});
app.post('/new_user', (request, response) => {
	for (let item in request.body)
		if (request.body[item] === '') values.push(null);
		else values.push(request.body[item]);
	client
		.query(query, values)
		.then(result => {
			response.render('main', { error: errorFlag });
			values = [];
		})
		.catch(error => {
			console.log(error.stack);
			errorFlag = true;
			response.render('main', { error: errorFlag });
			errorFlag = false;
			values = [];
		});
});
app.listen(PORT, (request, response) => {
	console.log('Server started on port: ' + PORT);
});
