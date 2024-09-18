import React from 'react';
import '../styles/searchbar.css';
function SearchBar({ searchTerm, setSearchTerm, placeholder = 'Search...' }) {
  return (
    <div >
      <input className='search-bar'
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
