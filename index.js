const express = require('express');
const app = express();
const port = 3000;

var neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://34.224.17.116:51853', neo4j.auth.basic('neo4j', 'panels-computations-concurrence'));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/test', (req, res) => {
  const query = 'MATCH (p:Person) RETURN p.name LIMIT 1';

  const session = driver.session();

  session.run(query)
    .then(function(result) {
      result.records.forEach(function(record) {
          res.send(record.get('p.name'));
      })
    })
    .catch(function(error) {
      console.log(error);
    });
})

app.listen(port, (err) => {
  if (err) {
      throw new Error("serveur don't listen");
  }
  console.log(`Server is listening on port ${port}`);
});
