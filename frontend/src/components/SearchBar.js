import React from 'react';

function SearchBar({ searchTerm, setSearchTerm, placeholder = 'Search...' }) {
  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
