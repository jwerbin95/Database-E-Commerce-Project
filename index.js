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
	'SELECT product.product_id, company.name as cname, product.name as pname, product.price, product.description, product.stock FROM product INNER JOIN company ON product.company_fk=company.company_id';
const PORT = 3000;

const loggedIn = []
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
	response.render('main', { notLogged: false, error: errorFlag });
});

app.get('/login', (request, response) => {
	let stopFlag = false
	for(let i = 0;i<loggedIn.length;i++){
		if(request.connection.remoteAddress===loggedIn[i].address){
			stopFlag = true
			response.render('main', {notLogged: false, error: true})
		}
	}
	if(!stopFlag){
		response.render('login', { error: errorFlag });
	}
});

app.get('/product_catalog', (request, response) => {
	client
		.query(productsSelect)
		.then(result => {
			products = result.rows;
		})
		.then(result=>{
			response.render('product_catalog', { products });
		})
		.catch(error => {
			console.log(error.stack);
		});
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
app.get('/user_account', (request, response)=>{
	let loggedInFlag = false
	for(let i = 0;i<loggedIn.length;i++){
		if(loggedIn[i].address===request.connection.remoteAddress)
			loggedInFlag = true
	}
	if(loggedInFlag){
		for(let user of loggedIn){
			if(user.address===request.connection.remoteAddress){
				const userQuery = `SELECT * FROM "User" WHERE user_id=${user.user_id}`
				client
					.query(userQuery)
					.then(result=>{
						let newCartData = getCartData(user.user_id).then(gcdresult=>{
							response.render('user_account', {user: result.rows[0], cartData: gcdresult.rows})
						})
					})
			}
		}
	}
	else{
		response.render('main', {notLogged: true, error: false})
	}
})
app.get('/user_account/logout', (request, response)=>{
	for(let i = 0;i<loggedIn.length;i++){
		if(request.connection.remoteAddress===loggedIn[i].address){
			loggedIn.splice(i, 1)
		}
	}
	response.redirect('/home')
})
app.get('/edit_profile', (request, response)=>{
	response.render('edit_user')
})
app.post('/edit_profile', (request, response)=>{
	for(let user of loggedIn){
		if(user.address===request.connection.remoteAddress){
			if(request.body['User Name']!=""){
				let updateUser = `UPDATE "User" SET user_name='${request.body['User Name']}' WHERE user_id=${user.user_id}`
				client
					.query(updateUser)
					.then(result=>{
						console.log("Successfully updated user!")
						response.redirect('/user_account')
					})
					.catch(error=>{
						console.log(error.stack)
						response.send("Something Went Wrong :(")
					})
			}
		}
	}
})
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
						response.redirect('user_account');
					})
					.catch(error => {
						console.log(error.stack)
						response.send('Something Went Wrong :(');
					});
					loggedIn.push({address: request.connection.remoteAddress, user_id: result.rows[0].user_id})
			}
		})
		.catch(error => {
			console.log(error.stack);
			errorFlag = true;
			response.render('login', { error: errorFlag });
			errorFlag = false;
		});
});
app.post('/product_catalog', (request, response)=>{
	let cartData = request.body['cartData']
	let userId = null;
	cartData = cartData.slice(0, -1);
	const cartProductSelect = `SELECT * FROM product WHERE product_id=${cartData}`
	for(let user of loggedIn){
		if(user.address === request.connection.remoteAddress)
			userId = user.user_id
	}
	client
		.query(cartProductSelect)
		.then(result=>{
			let nextQuery = result
			const userCartQuery = `SELECT cart_fk FROM "User" WHERE user_id=${userId}`
			client
				.query(userCartQuery)
				.then(result=>{
					const addCartQuery = `INSERT INTO "cart_and_product" (product_fk, cart_fk) VALUES(${nextQuery.rows[0].product_id}, ${result.rows[0].cart_fk})`
					console.log(addCartQuery)
					client
						.query(addCartQuery)
						.then(result=>{
						//console.log(result)
						response.redirect('/user_account')
				})
				.catch(error=>{
					console.log(error.stack)
					response.send("Something Went Wrong :(")
				})
			})
				
		})
		.catch(error=>{
			console.log(error.stack)
			response.send("Something Went Wrong :(")
		})
})
app.post('/add_a_product', (request, response) => {
	readBody(request, response, productQuery, 'new_product');
});

app.post('/new_user', (request, response) => {
	readBody(request, response, userQuery, 'new_user', createCart);
});

app.post('/register_company', (request, response) => {
	readBody(request, response, companyQuery, 'new_company');
});
app.post('/user_account', (request, response)=>{
	for(let item in request.body){
		let toRemove = request.body[item].slice(0, -1);
		let removeFromCartQuery = `DELETE FROM cart_and_product WHERE product_fk=${toRemove}`
		client
			.query(removeFromCartQuery)
			.then(result=>{
				console.log("Successfully removed item from cart!")
			})
			.catch(error=>{
				console.log(error.stack)
				response.send("Something Went Wrong :(")
			})
	}
	response.redirect('/home')
})
async function getCartData(userKey){
	//console.log(userKey)
	let promise = new Promise((resolve, reject)=>{
	const cartQuery = `SELECT cart_fk FROM "User" WHERE user_id=${userKey}`
	client
		.query(cartQuery)
		.then(result=>{
			console.log(result)
			let cart = result.rows[0].cart_fk
			const cartQuery = `SELECT product.company_fk, product.description, product.name, product.price, product.product_id, product.stock FROM product INNER JOIN cart_and_product ON cart_and_product.product_fk=product.product_id WHERE cart_and_product.cart_fk=${cart}`
		client
			.query(cartQuery)
			.then(result=>{
				resolve(result)
			})
			.catch(error=>{
				console.log(error.stack)
			})
		})
		.catch(error=>{
			console.log(error.stack)
		})
	})
	let returnValue = await promise;
	return returnValue
}

function login(userName, password) {
	let userSelect = `SELECT user_id, user_name, email, phone_number, address FROM "User" WHERE user_name='${userName}' AND password='${password}'`;
	return userSelect;
}
function showCart(userId) {
	const cartSelect = `SELECT product.name, product.price FROM product, cart_and_product WHERE cart_and_product.cart_fk=${userId} AND product.product_id=cart_and_product.product_fk`;
	return cartSelect;
}
function createCart(customerId) {
	client.query(
		`INSERT INTO "cart" () VALUES() RETURNING *`
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
			response.render('main', { notLogged: false, error: errorFlag });
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
