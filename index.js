const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');
const connectionString = 'postgresql://localhost:5432/E-Commerce';
const client = new Client({ connectionString });

const userQuery =
	'INSERT INTO "User" (user_name, password, email, phone_number, credit_card_number, address) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
const companyQuery =
	'INSERT INTO "company" (name, description) VALUES($1, $2) RETURNING *';
const productQuery =
	'INSERT INTO "product" (name, company_fk, description, price) VALUES($1, $2, $3, $4) RETURNING *';
const productsSelect =
	'SELECT company.name as cname, product.name as pname, product.price, product.description, product.stock FROM product INNER JOIN company ON product.company_fk=company.company_id';
const PORT = 3000;

let values = [];
let app = express();
let errorFlag = false;
let products = [];

client.connect();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/home', (request, response) => {
	response.render('main', { error: errorFlag });
});

app.get('/login', (request, response) => {
	response.render('login', { error: errorFlag });
});

app.get('/product_catalog', (request, response) => {
	client
		.query(productsSelect)
		.then(result => {
			products = result.rows;
		})
		.catch(error => {
			console.log(error.stack);
		});
	response.render('product_catalog', { products });
});

app.get('/new_user', (request, response) => {
	response.render('new_user', { error: errorFlag });
});

app.get('/register_company', (request, response) => {
	response.render('new_company', { error: errorFlag });
});

app.get('/add_a_product', (request, response) => {
	response.render('new_product', { error: errorFlag });
});

app.post('/login', (request, response) => {
	let credentials = login(
		request.body['User Name'],
		request.body['Password']
	);
	client
		.query(credentials)
		.then(result => {
			if (result.rows[0] === undefined) throw Error('User not found');
			else {
				let shoppingCart = showCart(result.rows[0].user_id);
				let next = result;
				client
					.query(shoppingCart)
					.then(result => {
						response.render('user_account', {
							user: next.rows[0],
							cartData: result.rows
						});
					})
					.catch(error => {
						response.send('Something Went Wrong :(');
					});
			}
		})
		.catch(error => {
			console.log(error.stack);
			errorFlag = true;
			response.render('login', { error: errorFlag });
			errorFlag = false;
		});
});

app.post('/add_a_product', (request, response) => {
	readBody(request, response, productQuery, 'new_product');
});

app.post('/new_user', (request, response) => {
	readBody(request, response, userQuery, 'new_user', createCart);
});

app.post('/register_company', (request, response) => {
	readBody(request, response, companyQuery, 'new_company');
});

function login(userName, password) {
	let userSelect = `SELECT user_id, user_name, email, phone_number, address FROM "User" WHERE user_name='${userName}' AND password='${password}'`;
	return userSelect;
}
function showCart(userId) {
	const cartSelect = `SELECT product.name, product.price FROM product, cart_and_product, cart WHERE cart.user_fk=${userId} AND cart_and_product.cart_fk=cart.cart_id AND product.cart_fk=cart.cart_id`;
	return cartSelect;
}
function createCart(customerId) {
	client.query(
		`INSERT INTO "cart" (user_fk) VALUES(${customerId}) RETURNING *`
	);
}

function readBody(request, response, query, errorPage, callback) {
	for (let item in request.body)
		if (request.body[item] === '') values.push(null);
		else values.push(request.body[item]);
	client
		.query(query, values)
		.then(result => {
			if (typeof callback === 'function')
				callback(result.rows[0].user_id);
			response.render('main', { error: errorFlag });
			values = [];
		})
		.catch(error => {
			console.log(error.stack);
			errorFlag = true;
			response.render(errorPage, { error: errorFlag });
			errorFlag = false;
			values = [];
		});
}
app.listen(PORT, (request, response) => {
	console.log('Server started on port: ' + PORT);
});
