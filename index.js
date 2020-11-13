const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')))

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

app.listen(PORT, (err) => {
  if (err) {
      throw new Error("serveur don't listen");
  }
  console.log(`Server is listening on port ${PORT}`);
});
