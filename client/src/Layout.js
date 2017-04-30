import React from 'react'
import PresenceList from './PresenceList'

const Layout = props => (
  <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <header className="mdl-layout__header">
      <div className="mdl-layout__header-row">
        <span className="mdl-layout-title">GraphQL SSE subscriptions - A user presence list</span>
        <div className="mdl-layout-spacer"></div>
        <nav className="mdl-navigation mdl-layout--large-screen-only">
          <a className="mdl-navigation__link" href="https://github.com/MikeBild/graphql-subscriptions-sse-presence-list" target="_blank">GitHub</a>
        </nav>
      </div>
    </header>
    <main className="mdl-layout__main">
      <div className="page-content" style={{padding: '20px'}}>
        <PresenceList />
      </div>
    </main>
  </div>
)

export default Layout
