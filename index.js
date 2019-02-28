//***********************************************************
//Author: Jacob Werbin
//Description: Backend for E-Commerce Website
//Modified: Feb 6, 2019
//**********************************************************

//**********************************************************
//File Imports
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg');
const morgan = require('morgan')
const fs = require('fs')
const cors = require('cors')
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
//**********************************************************

//**********************************************************
//Static Queries to manage database
const deleteFromCart = {
	name: 'remove-from-cart',
	text: 'DELETE FROM cart_and_product USING "User" WHERE cart_and_product.cart_fk = "User".cart_fk AND "User".connection=$1 AND cart_and_product.product_fk = $2',
	values: []
}
const editUser = {
		name:'update-user',
		text:'UPDATE "User" SET user_name=$1, email=$2 WHERE connection=$3',
		values: []
}
const user = {
	name:"user-query",
	text:'SELECT * FROM "User" WHERE connection=$1',
	values: []
}
const products = 'SELECT * FROM product'
const companies = 'SELECT * FROM company'
const cart = {
	name:'cart-query',
	text: 'SELECT product.name, product.price, product_id FROM product, cart_and_product, "User" WHERE "User".connection = $1 AND cart_and_product.product_fk=product_id AND "User".cart_fk=cart_and_product.cart_fk',
	values:[]
}

const addToCart = {
	name:'add-to-cart',
	text:'INSERT INTO cart_and_product(product_fk, cart_fk) VALUES($1, $2)',
	values: []
}
const insertUser = 'INSERT INTO "User"(user_name, password, email, phone_number, credit_card_number, address) VALUES($1, $2, $3, $4, $5, $6)'
const insertCompany = 'INSERT INTO company(name, description) VALUES($1, $2)'
const insertProduct = 'INSERT INTO product(company_fk, name, description, price, stock) VALUES($1, $2, $3, $4, $5)'
//***********************************************************

//***********************************************************
//Data Structure, most variables are created within the scope of the gets/posts
const PORT = 3000;
const loggedIn = []
const connectionString = 'postgresql://localhost:5432/E-Commerce';
const client = new Client({ connectionString });

let app = express();
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'server_log.log'), { flags: 'a' })
//***********************************************************

//***********************************************************
//Middleware
client.connect();

app.use(cors({}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(morgan('combined', { stream: accessLogStream }))
//***********************************************************

//***********************************************************
//Get requests
app.get('/products', async(request, response) => {
	let result = await queryDB(products, null)
	let data = []
	result.rows.map(item=>{
		data.push(item)
	})
	response.json(data)
});

app.get('/user/:id', async(request, response) => {
	user.values.push(request.params.id)
	let result = await queryDB(user, null)
	let data = []
	result.rows.map(item=>{
		data.push(item)
	})
	response.json(data)
	user.values = []
});

app.get('/companies', async(request, response)=>{
	let result = await queryDB(companies, null)
	let data = []
	result.rows.map(item=>{
		data.push(item)
	})
	response.json(data)
})

app.get('/cart/:id', async(request, response)=>{
	cart.values.push(request.params.id)
	let result = await queryDB(cart, null)
	let data = []
	result.rows.map(item=>{
		data.push(item)
	})
	response.json(data)
	cart.values=[]
});
//**********************************************************
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://jw95.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'vj4D4dlgRoeOiSbTii3BEmFdIQCX0clO',
  issuer: `https://jw95.auth0.com/`,
  algorithms: ['RS256']
});
//**********************************************************
//Post Requests
app.post('/add_to_cart', async(request, response) => {
	for(let item in request.body){
		addToCart.values.push(parseInt(request.body[item]))
	}
	let queried = await queryDB(addToCart, null)
	addToCart.values=[]
	response.json(queried)
});

app.post('/new_user', async(request, response) => {
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	let queried = await queryDB(insertUser, values)
	response.json(queried)
});

app.post('/new_product', async(request, response) => {
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	let queried = await queryDB(insertProduct, values)
	response.json(queried)
});

app.post('/new_company', async(request, response) => {
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	let queried = await queryDB(insertCompany, values)
	response.json(queried)
});
//**********************************************************

//**********************************************************
//Put Requests
app.put('/edit_user/:id', async(request, response)=>{
	for(let item in request.body){
		editUser.values.push(request.body[item])
	}
	editUser.values.push(request.params.id)
	let queried = await queryDB(editUser, null)
	editUser.values=[]
	response.json(queried)
});
//**********************************************************

//**********************************************************
//Delete Requests
app.delete('/remove_from_cart', async(request, response)=>{
	for(let item in request.body){
		deleteFromCart.values.push(request.body[item])
	}
	let queried = await queryDB(deleteFromCart, null)
		.then(data=>{
			console.log("Database has been queried for delete request.")
		})
		.catch(error=>{
			console.log(error.stack)
		})
	deleteFromCart.values=[]
	response.json(queried)
});
//**********************************************************

//**********************************************************
//Function to query the database
function queryDB(query, values){
	let promise = new Promise((resolve, reject)=>{
	if(values===null){
			client
				.query(query)
				.then(result=>{
					resolve(result)

			})
				.catch(error=>{
					console.log(error.stack)
				})
		}
		else{
			client
				.query(query, values)
				.then(result=>{
					resolve(result)
			})
				.catch(error=>{
					console.log(error.stack)
				})
		}
	})
	return promise
}
//**********************************************************
app.use(function (error, request, respose, next) {
  console.error(error.stack)
  response.status(500).send('Something Went Wrong :(')
})
//**********************************************************
//SQL query to delete row from table
function deleteRow(id, table, response){
	const deleteQuery = `PREPARE query(INT) AS DELETE FROM ${table} WHERE user_id=$1; EXECUTE query(${id}); DEALLOCATE query;`
	client
		.query(deleteQuery)
		.then(result=>{
			response.json(result)
		})
}
//**********************************************************

//**********************************************************
//Server Start
app.listen(PORT, (request, response) => {
	console.log('Server started on port: ' + PORT);
});
//**********************************************************
