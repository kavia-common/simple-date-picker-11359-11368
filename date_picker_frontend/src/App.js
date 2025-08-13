import React from 'react';
import './App.css';
import './tokens.css';
import DoubleViewCalendar from './components/DoubleViewCalendar';

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ background: 'transparent', boxShadow: 'none' }}>
        <DoubleViewCalendar />
      </header>
    </div>
  );
}

export default App;
