import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
// import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { createStore } from "./redux/store";
import Root from "./Root";

const serverState = window.__PRELOADED_STATE__;

let store;
if (serverState) {
  // server has no localStorage, so let the browser decide auth itself
  const { auth, ...rest } = serverState;
  store = createStore(rest);
} else {
  store = createStore();
}

const app = (
  <StrictMode>
    {/* <HelmetProvider> */}
      <Provider store={store}>
        <BrowserRouter>
          <Root />
        </BrowserRouter>
      </Provider>
    {/* </HelmetProvider> */}
  </StrictMode>
);

const container = document.getElementById("root");

if (serverState) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}