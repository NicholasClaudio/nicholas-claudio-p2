import React from 'react';

const Entry = props => {
  const { entry } = props;

  return (
    <div>
    <p>{entry.description}</p>
    <p>{entry.servingSize} {entry.unit}</p>
    <p>{entry.servingsPerContainer}</p>
    </div>
  )
}

export default Entry;