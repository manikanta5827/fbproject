import React from 'react';
import '../styles/AvatarCircle.css';  

function AvatarCircle({ name }) {
  const getInitial = (name) => name.charAt(0).toUpperCase();

  return (
    <div className="avatar-circle">
      {getInitial(name)}
    </div>
  );
}

export default AvatarCircle;
