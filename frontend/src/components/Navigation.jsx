import React from 'react'
import { Link } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          📄 PDF Processor
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/merge" className="nav-link">
              Merge
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/split" className="nav-link">
              Split
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/rotate" className="nav-link">
              Rotate
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/sign" className="nav-link">
              Sign
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
