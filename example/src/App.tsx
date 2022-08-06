import { Fragment } from 'react';

import { NavLink as ReactRouterNavLink, Route, Routes } from 'react-router-dom';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Counter } from './Counter';

import '@fontsource/jetbrains-mono/latin-400.css';
import './styles.css';

export const App = () => (
  <Fragment>
    <nav>
      <NavLink to="/">Home page</NavLink>
      {' | '}
      <NavLink to="/counter">counter</NavLink>
    </nav>

    <hr
      css={css`
        border: 0;
        border-top: 1px solid #ccc;
      `}
    />

    <Routes>
      <Route path="" element={<>Welcome!</>} />
      <Route path="counter" element={<Counter />}></Route>
      <Route path="*" element={<>Not found.</>} />
    </Routes>
  </Fragment>
);

const NavLink = styled(ReactRouterNavLink)`
  &.active {
    font-weight: bold;
  }
`;
