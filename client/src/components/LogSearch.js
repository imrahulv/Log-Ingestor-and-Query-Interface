import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Form } from 'react-bootstrap';

// LogSearch functional component
const LogSearch = () => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('level'); // Default selected filter
  const [filters, setFilters] = useState([{ field: 'level', value: '' }]); // Default filter

   // Function to handle search based on filters
  const handleSearch = async () => {
    try {
      const response = await fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters, query }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error.message);
    }
  };

  // Function to handle full-text search
  const handleFullSearch = async () => {
    try {
      const response = await fetch('/globalSearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters, query }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error.message);
    }
  };

  // Function to add a new filter
  const handleAddFilter = () => {
    setFilters([...filters, { field: 'level', value: '' }]);
  };

  // Function to remove a filter based on index
  const handleRemoveFilter = (index) => {
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    setFilters(updatedFilters);
  };

  // Function to render the input for filter value
  const renderFilterValueInput = (filter, index) => {
    if (filter.field === 'timestamp') {
      return (
        <div key={index} className="mb-3">
          <label className="form-label">
            Filter {index + 1}:
            <div className="d-flex">
            <span className="me-2">Timestamp</span>
              <DatePicker
                selected={filter.value[0]}
                onChange={(date) => {
                  const updatedFilters = [...filters];
                  updatedFilters[index].value[0] = date;
                  setFilters(updatedFilters);
                }}
                selectsStart
                startDate={filter.value[0]}
                endDate={filter.value[1]}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="form-control me-2"
              />
              <DatePicker
                selected={filter.value[1]}
                onChange={(date) => {
                  const updatedFilters = [...filters];
                  updatedFilters[index].value[1] = date;
                  setFilters(updatedFilters);
                }}
                selectsEnd
                startDate={filter.value[0]}
                endDate={filter.value[1]}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="form-control me-2"
              />
            </div>
            <button onClick={() => handleRemoveFilter(index)} className="btn btn-danger mt-2">
              Remove
            </button>
          </label>
        </div>
      );
    }

    return (
      <div key={index} className="mb-3">
        <label className="form-label">
          Filter {index + 1}:
          <div className="d-flex">
            <select
              value={filter.field}
              onChange={(e) => {
                const updatedFilters = [...filters];
                updatedFilters[index].field = e.target.value;
                updatedFilters[index].value = [''];
                setFilters(updatedFilters);
              }}
              className="form-select me-2"
            >
              <option value="level">Level</option>
              <option value="message">Message</option>
              <option value="resourceId">Resource ID</option>
              <option value="timestamp">Timestamp</option>
              <option value="traceId">Trace ID</option>
              <option value="spanId">Span ID</option>
              <option value="commit">Commit</option>
              <option value="metadata.parentResourceId">Parent Resource ID</option>
            </select>

            <input
              type="text"
              value={filter.value}
              onChange={(e) => {
                const updatedFilters = [...filters];
                updatedFilters[index].value = e.target.value;
                setFilters(updatedFilters);
              }}
              className="form-control me-2"
            />

            <button onClick={() => handleRemoveFilter(index)} className="btn btn-danger mt-2">
              Remove
            </button>
          </div>
        </label>
      </div>
    );
  };

  // Main JSX content
  return (
    <Container className="mt-5">
      <h1>Log Query Interface</h1>

      {/* Filters Section */}
      <div className="mb-4">
        <h2>Filtered Search</h2>
        {filters.map((filter, index) => renderFilterValueInput(filter, index))}
        <Button onClick={handleAddFilter} className="btn btn-primary me-2">
          Add Filter
        </Button>
        <Button onClick={handleSearch} className="btn btn-success">
          Search
        </Button>
      </div>

      {/* Full-text search Section */}
      <div className="mb-4">
        <h2>Global Search</h2>
        <Form.Group controlId="fullTextSearch">
          <Form.Label>Searches across all the fields:</Form.Label>
          <Form.Control
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
        <Button onClick={handleFullSearch} className="btn btn-success">
          Full Search
        </Button>
      </div>

      {/* Display search results */}
      <div className="mt-4">
        {logs.map((log) => (
          <div key={log._id} className="alert alert-secondary">
            <pre>{JSON.stringify(log._source, null, 2)}</pre>
          </div>
        ))}
      </div>
    </Container>
  );

};

// Export LogSearch component as the default export
export default LogSearch;

