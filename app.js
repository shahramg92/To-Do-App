// Create a database with the following schema:
//
// CREATE TABLE task (
//   id serial PRIMARY KEY,
//   description varchar,
//   done boolean
// );
// The app should meet the following requirements:
//
// URL /todos should list all your ToDos
// URL /todos/add should have a form which lets you add a ToDo
// URL /todo/done/:id should mark a ToDo as done.


// import express
const express = require('express');
// set up express server
const app = express();
const body_parser = require('body-parser');
const promise = require('bluebird');
const pgp = require('pg-promise')({promiseLib: promise});
const db = pgp({database: 'todo'});


app.set('view engine', 'hbs');
app.use('/static', express.static('public'));
app.use(body_parser.urlencoded({extended: false}));


app.get('/', function(request, response){
  response.send('test')
})
app.get('/todos', function(request, response) {
  query = 'SELECT * FROM task'
  db.any(query)
    .then (function(resultsArray) {
      context = {title: "To-do List", results: resultsArray}
      response.render('todos.hbs', context)
    })
    .catch(function(err){
      console.error(err);
      response.send('Something went wrong! Sorry. Error text: ' + err)
    })
});

app.get('/todos/form', function(request, response) {
  context = {
    title: "Add a new To-Do"
  }
  response.render('form.hbs', context)
});

app.get('/todos/:id', function(request, response, next) {
  id = request.params.id;
  query = 'UPDATE task SET done = TRUE WHERE id = $1'
  db.any(query, id)
    .then (function() {
      response.redirect('/todos')
    })
    .catch(next);
})

app.get('/error', function(request, response) {
  response.render('error.hbs')
})

app.post('/submit', function(request, response, next){
  let query = 'INSERT INTO task VALUES (DEFAULT, $1 ,DEFAULT)';
  let item = request.body.name;
  console.log(item);
  db.query(query, item)
    .then (function() {
      response.redirect('/todos')
    })
    .catch(next);
})

app.listen(1337, function(request, response){
  console.log('Access granted to port 1337')
});
