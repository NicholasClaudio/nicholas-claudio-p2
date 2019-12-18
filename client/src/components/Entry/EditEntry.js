import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './styles.css';

const EditEntry = ({ token, entry, onEntryUpdated }) => {
  let history = useHistory();
  const [entryData, setEntryData] = useState({
    description: entry.description,
    servingSize: entry.servingSize,
    unit: entry.unit,
    servingsPerContainer: entry.servingsPerContainer
  });
  const { description, servingSize, unit, servingsPerContainer } = entryData;

  const onChange = e => {
    const { name, value } = e.target;

    setEntryData({
      ...entryData,
      [name]:value
    });
  };

  const update = async () => {
    if (!description || !servingSize || !unit || !servingsPerContainer ) {
      console.log('All fields are required');
    } else {
      const newEntry = {
        description: description,
        servingSize: servingSize,
        unit: unit,
        servingsPerContainer: servingsPerContainer
      };

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        };

        const description = JSON.stringify(newEntry);
        const res = await axios.put(
          `http://localhost:5000/api/entries/${entry._id}`,
          description,
          config
        );

        onEntryUpdated(res.data);
        history.push('/');
      } catch (error) {
        console.error(`Error creating entry: ${error.response.data}`);
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Edit Entry</h2>
      <input 
        name="description"
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => onChange(e)}
      />
      <input
        name="servingSize"
        type="text"
        placeholder="Serving Size"
        value={servingSize}
        onChange={e => onChange(e)}
      />
      <input
        name="unit"
        type="text"
        placeholder="Unit"
        value={unit}
        onChange={e => onChange(e)}
      />
      <input
        name="servingsPerContainer"
        type="text"
        placeholder="Number of Servings"
        value={servingsPerContainer}
        onChange={e => onChange(e)}
      />
      <button onClick={() => update()}>Submit</button>
    </div>
  );
};

export default EditEntry;