import React from 'react';
import AvatarCircle from './AvatarCircle';

function UserList({ users, handleRequest, handleRemove }) {
  if (users.length === 0) return null;

  return (
    <div className="users-section">
      {users.map((user, index) => (
        <div className="row" key={index}>
          <AvatarCircle name={user} />
          <p>{user}</p>
          <div>
            <button
              className="accept"
              onClick={() => handleRequest(user, 'user')}
            >
              Send
            </button>
            <button
              className="decline"
              onClick={() => handleRemove(user, 'user')}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserList;
