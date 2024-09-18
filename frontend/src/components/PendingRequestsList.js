import React from 'react';
import AvatarCircle from './AvatarCircle';

function PendingRequestsList({ pendingRequests, cancelRequest }) {
  if (pendingRequests.length === 0) return null;

  return (
    <div className="pending-requests-section">
      <h3>Pending requests</h3>
      <p>You have {pendingRequests.length} pending request(s).</p>
      {pendingRequests.map((user, index) => (
        <div className="row" key={index}>
          <AvatarCircle name={user} />
          <p>{user}</p>
          <div>
            <span>STATUS: Pending</span>
          </div>
          <button onClick={() => cancelRequest(user, 'pending')}>Cancel</button>
        </div>
      ))}
    </div>
  );
}

export default PendingRequestsList;
