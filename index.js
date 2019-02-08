//**********************************************************
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
//**********************************************************

//**********************************************************
//Static Queries to manage database
const users = 'SELECT * FROM "User"'
const products = 'SELECT * FROM product'
const companies = 'SELECT * FROM company'
const carts = 'SELECT * FROM cart'

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

app.use(bodyParser.urlencoded({ extended: true }));
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

app.get('/users', async(request, response) => {
	let result = await queryDB(users, null)
	let data = []
	result.rows.map(item=>{
		data.push(item)
	})
	response.json(data)
});

app.get('/companies', async(request, response)=>{
	let result = await queryDB(companies, null)
	let data = []
	result.rows.map(item=>{
		data.push(item)
	})
	response.json(data)
})

app.get('/carts', async(request, response)=>{
	let result = await queryDB(carts, null)
	let data = []
	result.rows.map(item=>{
		data.push(item)
	})
	response.json(data)
});
//**********************************************************

//**********************************************************
//Post Requests
app.post('/new_product', async(request, response) => {
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	let queried = await queryDB(insertProduct, values)
	response.send("Successfully Added New product!")
});

app.post('/new_user', async(request, response) => {
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	let queried = await queryDB(insertUser, values)
	response.send("Successfully Added New User!")
});

app.post('/new_company', async(request, response) => {
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	let queried = await queryDB(insertCompany, values)
	response.send("Successfully Added New Company!")
});
//**********************************************************

//**********************************************************
//Put Requests
app.put('/edit_user/:id', async(request, response)=>{
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	const editUser = `PREPARE query(INT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INT) AS UPDATE "User" SET user_name=$2, password=$3, email=$4, phone_number=$5, credit_card_number=$6, address=$7, cart_fk=$8 WHERE user_id=$1; EXECUTE query(${request.params.id}, '${values[0]}', '${values[1]}', '${values[2]}', '${values[3]}', '${values[4]}', '${values[5]}', ${values[6]}); DEALLOCATE query;`
	client
		.query(editUser)
		.then(result=>{
			response.json(result)
		})
});

app.put('/edit_company/:id', (request, response)=>{
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	const editCompany = `PREPARE query(INT, TEXT, TEXT) AS UPDATE company SET name=$2, description=$3 WHERE company_id=$1; EXECUTE query(${request.params.id}, '${values[0]}', '${values[1]}'); DEALLOCATE query;`
	client
		.query(editCompany)
		.then(result=>{
			response.json(result)
		})
});

app.put('/edit_product/:id', (request, response)=>{
	let values = []
	for(let item in request.body){
		values.push(request.body[item])
	}
	const editProduct = `PREPARE query(INT, INT, TEXT, TEXT, NUMERIC, INT) AS UPDATE product SET company_fk=$2, name=$3, description=$4, price=$5, stock=$6 WHERE product_id=$1; EXECUTE query(${request.params.id}, '${values[0]}', '${values[1]}', '${values[2]}', ${values[3]}, ${values[4]}); DEALLOCATE query;`
	client
		.query(editProduct)
		.then(result=>{
			response.json(result)
		})
});
//**********************************************************

//**********************************************************
//Delete Requests
app.delete('/delete_user/:id', (request, response)=>{
	deleteRow(request.params.id, "\"User\"", response)
});

app.delete('/delete_company/:id', (request, response)=>{
	deleteRow(request.params.id, "company", response)
});

app.delete('/delete_product/:id', (request, response)=>{
	deleteRow(request.params.id, "product", response)
});

app.delete('/delete_product_from_cart/:id', (request, response)=>{
	deleteRow(request.params.id, "cart_and_product", response)
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
		}
		else{
			client
				.query(query, values)
				.then(result=>{
					resolve(result)
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
