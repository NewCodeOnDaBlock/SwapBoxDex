import './App.css';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import SwapBox from './components/SwapBox';


function App() {

  const Moralis = require('moralis');
  const serverUrl = "https://obf13w1odcee.usemoralis.com:2053/server";
  const appId = "BZTEDEMHTdaGTzDqEOjGOSK94JApMx8wEocD10hw";
  Moralis.start({ serverUrl, appId });

  return (
    <BrowserRouter>
      <Link to="/swap"></Link>
      <Switch>
        <Route path="/swap">
          <SwapBox Moralis={Moralis}/>

        </Route>
      </Switch>



    </BrowserRouter>
  );
}

export default App;
