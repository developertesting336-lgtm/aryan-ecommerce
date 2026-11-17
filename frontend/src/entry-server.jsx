import { renderToString } from "react-dom/server";
import { StaticRouter, matchPath } from "react-router";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import Root from "./Root";
import { getRootCategories } from "./redux/slices/categorySlice";

const ssrRoutes = [
  { path: "/",         load: (store) => store.dispatch(getRootCategories()) },
  { path: "/products", load: (store, query) => null }, // add your products thunk
  { path: "/search",   load: (store, query) => null }, // add your search thunk
];

export async function render(url) {
  const store = createStore();
  const { pathname, searchParams } = new URL(url, "http://localhost");

  const route = ssrRoutes.find((r) =>
    matchPath({ path: r.path, end: true }, pathname)
  );
  if (route) await route.load(store, Object.fromEntries(searchParams));

  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={url}>
        <Root />
      </StaticRouter>
    </Provider>
  );

  return { html, state: store.getState() };
}