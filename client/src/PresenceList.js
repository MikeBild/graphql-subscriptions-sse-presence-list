import React from 'react'
import { gql, graphql, compose } from 'react-apollo'
import { uniqBy, differenceBy } from 'lodash'

const FetchUsers = gql`query fetchUsers {
  users {
    id
    alias
    presence {
      status
    }
  }
}`

const JoinMutation = gql`mutation join($input: UserInput) {
  join(input: $input) {
    id
    alias
    presence {
      status
    }
  }
}`

const LeaveMutation = gql`mutation leave($id: ID) {
  leave(id: $id) {
    id
    alias
    presence {
      status
    }
  }
}`

const ToggleMutation = gql`mutation toggle($input: PresenceInput) {
  toggle(input: $input) {
    id
    alias
    presence {
      status
    }
  }
}`

const PresenceSubscription = gql`subscription {
  onPresence {
    id
    alias
    presence {
      status
    }
  }
}`

export class PresenceList extends React.Component {
  state = {
    alias: undefined,
    id: undefined,
  }

  componentDidMount () {
    this.props.data.subscribeToMore({
      document: PresenceSubscription,
      variables: {},
      updateQuery: (prev, {subscriptionData}) => {
        const result = { users: prev.users }
        if(subscriptionData.data.onPresence.presence.status === 'LEFT') {
          result.users = differenceBy(prev.users, [subscriptionData.data.onPresence], x => x.id)
          if(subscriptionData.data.onPresence.id === this.state.id) this.setState({id: undefined, alias: undefined})
          return result
        }

        result.users = uniqBy(prev.users.concat([subscriptionData.data.onPresence]), x => x.id)
        return result
      }
    })
  }

  render () {
    const personStatusIndicatorColors = {
      AVAILABLE: '#4caf50',
      BUSY: '#9e9e9e',
      INACTIVE: '#ff9800'
    }
    return (
      <div>
        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input className="mdl-textfield__input" type="text" onChange={e => this.setState({alias: e.target.value || 'anonymous'})} />
          <label className="mdl-textfield__label">Enter an alias</label>
        </div>
        <div>
          <button disabled={!this.state.alias} className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onClick={() => this.props.join({variables: {input: {id: this.state.id, alias: this.state.alias}}}).then(data => this.setState({id: data.data.join.id}))}>Join</button>
          &nbsp;
          <button disabled={!this.state.id} className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onClick={() => this.props.leave({variables: {id: this.state.id}})}>Leave</button>
          &nbsp;
          <button disabled={!this.state.id} className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" onClick={() => this.props.toggle({variables: {input: {id: this.state.id, status: 'BUSY'}}})}>Busy</button>
        </div>
        <ul className="demo-list-item mdl-list">
          {
            this.props.data.users &&
            this.props.data.users.map(x =>
              <li className="mdl-list__item" key={x.id}>
                <i  title={x.presence.status} className="material-icons mdl-list__item-icon" style={{color: personStatusIndicatorColors[x.presence.status]}}>person</i>
                {x.alias}
              </li>
            )
          }
        </ul>
      </div>
    )
  }
}

export default compose(
  graphql(FetchUsers),
  graphql(JoinMutation, {name: 'join'}),
  graphql(LeaveMutation, {name: 'leave'}),
  graphql(ToggleMutation, {name: 'toggle'}),
)(PresenceList)