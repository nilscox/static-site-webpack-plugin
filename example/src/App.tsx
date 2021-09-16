import { Fragment } from 'react';

import { NavLink as ReactRouterNavLink, Route, Switch } from 'react-router-dom';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Counter } from './Counter';

import '@fontsource/jetbrains-mono/latin-400.css';
import './styles.css';

export const App: React.FC = () => (
  <Fragment>
    <nav>
      <NavLink exact to="/">
        Home page
      </NavLink>
      {' | '}
      <NavLink to="/counter">counter</NavLink>
    </nav>

    <hr
      css={css`
        border: 0;
        border-top: 1px solid #ccc;
      `}
    />

    <Switch>
      <Route path="/" exact>
        Welcome!
      </Route>
      <Route path="/counter">
        <Counter />
      </Route>
      <Route>Not found.</Route>
    </Switch>
  </Fragment>
);

const NavLink = styled(ReactRouterNavLink)`
  &.active {
    font-weight: bold;
  }
`;
