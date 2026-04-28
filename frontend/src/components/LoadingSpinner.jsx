import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullPage = true }) => {
  if (fullPage) {
    return (
      <div className="spinner-page">
        <div className="spinner-ring">
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    );
  }
  return <div className="spinner"></div>;
};

export default LoadingSpinner;
