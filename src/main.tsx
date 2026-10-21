import React from 'react'
import ReactDOM from 'react-dom/client'
import { MetisConfigProvider } from '@yuanfudao/metis-web-component'
import { zhCN } from '@yuanfudao/metis-web-component/dist/locale'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MetisConfigProvider locale={zhCN}>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </HashRouter>
    </MetisConfigProvider>
  </React.StrictMode>,
)
