import React from 'react';
import './Loader.css'; 

const Loader = () => {
  return (
    <div className="loader-wrapper">
        <h2>Welcome to</h2><br />
      <div className="logo-load">ARCE</div>
      <div className="logo-load-2">Housing Agency</div><br />
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
