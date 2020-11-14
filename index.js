const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

var neo4j = require('neo4j-driver');
var driver = neo4j.driver('bolt://34.224.17.116:51853', neo4j.auth.basic('neo4j', 'panels-computations-concurrence'));

app.get('/', (req, res) => {
  res.send('Finding rogue MI6 agents !')
});

function getQueryResult(res, query, key) {
  const session = driver.session();

  return session.run(query)
    .then(function(result) {
      const resultList = result.records.map(function(record) {
          return record.get(key);
      })
      res.send(
        resultList.length > 0
          ? resultList
          : 'No match'
        );
    })
    .catch(function(error) {
      console.log(error);
    });
};

app.get('/investigation-result', (req, res) => {
  const query = 'MATCH (p:Person)--(:Crime)--(o:Officer)-[x]-(p) '
    + 'WHERE type(x) IN ["FAMILY_REL", "CALLER", "CALLED", "K.*"] '
    + 'RETURN o';

  getQueryResult(res, query, 'o');
});

app.get('/have-same-name', (req, res) => {
  const query = 'MATCH (p:Person) MATCH (o:Officer) '
    + 'WHERE p.surname = o.surname '
    + 'RETURN DISTINCT o';

  getQueryResult(res, query, 'o');
});

app.get('/have-name-relation', (req, res) => {
  const query = 'MATCH (p1:Person)--(p2:Person)-[:PARTY_TO]->(c:Crime)-[:INVESTIGATED_BY]->(o:Officer) '
    + 'WHERE o.surname in [p1.surname, p2.surname] '
    + 'RETURN o.surname';

  getQueryResult(res, query, 'o.surname');
});

app.get('/have-phone-relation', (req, res) => {
  const query = 'MATCH (p1:Person)-[:HAS_PHONE]->()--(:PhoneCall)--()<-[:HAS_PHONE]-(p2:Person)-[:PARTY_TO]->(c:Crime)-[:INVESTIGATED_BY]->(o:Officer) '
    + 'WHERE o.surname in [p1.surname, p2.surname] '
    + 'RETURN o.surname';

  getQueryResult(res, query, 'o.surname');
});

app.get('/have-location-relation', (req, res) => {
  const query = 'MATCH (p:Person)-[:CURRENT_ADDRESS]->(:Location)<-[:OCCURRED_AT]-(c:Crime)-[:INVESTIGATED_BY]->(o:Officer) '
    + 'WHERE p.surname = o.surname '
    + 'RETURN o.surname';

  getQueryResult(res, query, 'o.surname');
});

app.listen(PORT, (err) => {
  if (err) {
      throw new Error("serveur don't listen");
  }
  console.log(`Server is listening on port ${PORT}`);
});
