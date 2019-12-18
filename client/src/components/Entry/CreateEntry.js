import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './styles.css';

const CreateEntry = ({ onEntryCreated, token }) => {
  let history = useHistory();
  const [entryData, setEntryData] = useState({
    description: '',
    servingSize: '',
    unit: '',
    servingsPerContainer: ''
  });

  const { description, servingSize, unit, servingsPerContainer } = entryData;

  const onChange = e => {
    const { name, value } = e.target;

    setEntryData({
      ...entryData,
      [name]: value
    });
  };

  const create = async () => {
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
        const servingSize = JSON.stringify(newEntry);
        const unit = JSON.stringify(newEntry);
        const servingsPerContainer = JSON.stringify(newEntry);

        const res = await axios.post(
          'http://localhost:5000/api/entries',
          description,
          config
        );
        
        onEntryCreated(res.data);
        history.push('/');
      } catch (error) {
        console.error(`Error creating entry: ${error.response}`);
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Log new Entry</h2>
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
      <button onClick={() => create()}>Submit</button>
    </div>
  );
};

export default CreateEntry;