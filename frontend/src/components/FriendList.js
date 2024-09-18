import React from 'react';
import AvatarCircle from './AvatarCircle';

function FriendList({ friends, handleRequest, handleRemove }) {
  if (friends.length === 0) return null;

  return (
    <div className="mutual-friends-section">
      {friends.map(([name, friendsList], index) => (
        <div className="row" key={index}>
          <AvatarCircle name={name} />
          <p>{name}</p>
          <p className="mutual-friends-list">
            Mutual friends: {friendsList.join(', ')}
          </p>
          <div>
            <button
              className="accept"
              onClick={() => handleRequest(name, 'friend')}
            >
              Send
            </button>
            <button
              className="decline"
              onClick={() => handleRemove(name, 'friend')}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FriendList;
