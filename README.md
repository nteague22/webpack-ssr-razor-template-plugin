# webpack-ssr-razor-template-plugin
Webpack v4 plugin for generating AOT ASP.Net Razor partials that can be rendered Server Side and consumed reliably with react-dom hydrate()
- Will initially allow for a single React Component export to replace sync issues in separate server rendered markup to reactjs
- Will avoid the overhead of additional libraries on the application, where the heavy lifting is done during build and not execution.
- Allows for a precached initial state from json to be read and supplied to the server application for the Razor code as well as the starting state for the reactjs component, when using redux.
- Grants the benefits of SEO Optimization as well as the usability and performace of reactjs, without requiring a complete development buy-in.
