const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = 3000;
let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', (request, response) => {
	response.render('main');
});

app.listen(PORT, (request, response) => {
	console.log('Server started on port: ' + PORT);
});
