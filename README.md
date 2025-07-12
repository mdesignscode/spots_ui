# Spots GUI

This is a UI for interacting with the [Spots API](https://github.com/mdesignscode/spots_flask), written in React, and built using esbuilt (for 32bit support).

<br/>

<h2 style="text-align: center; color: #4CAF50;">Tech Stack</h2>

[React.js](https://react.dev)

<h2 style="text-align: center; color: #4CAF50;">Requirements</h2>

<strong><a href="https://nodejs.org/en/download/">Node.js</a></strong>

<h2 style="text-align: center; color: #4CAF50;">Setup</h2>

<h4>Clone this repo:</h4>

```bash
  git clone https://github.com/mdesignscode/spots_ui
```

<h4>Go to repo folder:</h4>

```bash
  cd spots_ui
```

<h4>Install dependencies</h4>

```npm
npm install
```

<h4>Add keys to environment:</h4>

<p style="margin-left: 1rem;">Create a file called <strong>.env</strong> at the root of the project and add the following:</p>

    REACT_APP_API_URL=http://localhost:5000/ # ensure server is running before starting up the UI

<h4>Build project</h4>

```bash
node build.js
```

<h4>Start Server</h4>

```bash
node server.js
```

<h2 style="text-align: center; color: #4CAF50;">License</h2>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

