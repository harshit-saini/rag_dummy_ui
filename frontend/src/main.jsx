import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.jsx'
import { store } from './store/store.js'
import './styles/index.css'

// This is the normal entry point for every React app we made this semester.
// The only new thing here is wrapping <App /> with <Provider> so that all
// our components can read/update the redux store.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
