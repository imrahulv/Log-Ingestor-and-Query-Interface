// log-ingestor.js
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');
const util = require('util');

const app = express();
const PORT = 3000;

const elasticsearchUrl = process.env.ELASTICSEARCH_NODE;
// Elasticsearch client
const esClient = new Client({ node: 'http://localhost:9200' });

// Middleware to parse JSON body
app.use(bodyParser.json());

// Endpoint for log ingestion
app.post('/logs', async (req, res) => {
  const log = req.body;

  try {
    // Index log in Elasticsearch
    await esClient.index({
      index: 'logs',
      body: log,
    });

    res.status(201).json({ message: 'Log ingested successfully' });
  } catch (error) {
    console.error('Error ingesting log:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint for log search
app.post('/search', async (req, res) => {
  const { filters, query } = req.body;

  try {
    //Build Elasticsearch query based on filters and full-text search
    const esQuery = {
      index: 'logs',
      query: {
        bool: {
          must: [],
        },
      },
    };

    //Add filters to the Elasticsearch query
    filters.forEach((filter)=>{
      if(filter['field']==='timestamp'){
        esQuery.query.bool.must.push({
          range: {
            timestamp: {
              gte: filter['value'][0],
              lte: filter['value'][1]
            }
          }
        })
      }
      else if (filter['value'] !== '') {
        esQuery.query.bool.must.push({
          match_phrase: {
            [filter['field']]: filter['value'],
          }
        })
      }
    })

    // Execute the Elasticsearch query
    const body = await esClient.search(esQuery);
    const hits = body.hits?.hits || []; // Ensure hits is defined

    res.status(200).json({ logs: hits });
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Endpoint for global search
app.post('/globalSearch', async (req, res) => {
  const { filters, query } = req.body;

  try {
    //Build Elasticsearch query based on filters and full-text search
    const esQuery = {
      index: 'logs',
      query: {
        query_string: {
          query: query,
        },
      },
    };

    // Execute the Elasticsearch query
    if(query!=''){
      const body = await esClient.search(esQuery);
      const hits = body.hits?.hits || []; // Ensure hits is defined

      res.status(200).json({ logs: hits });
    }
    
  } catch (error) {
    console.error('Error searching logs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Log Ingestor listening on port ${PORT}`);
});
