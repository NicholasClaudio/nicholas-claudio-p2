import React from 'react';
import EntryListItem from './EntryListItem';

const EntryList = props => {
  const { entries, clickEntry, deleteEntry, editEntry } = props;
  return entries.map(entry => (
    <EntryListItem
      key={entry._id}
      entry={entry}
      clickEntry={clickEntry}
      deleteEntry={deleteEntry}
      editEntry={editEntry}/>
  ));
};

export default EntryList;