# HomeTruth frontend

## Current environment — 19 November 2026

HomeTruth currently runs locally only. There is no hosted staging or production
environment. Repository folder names ending in `-staging` are historical names,
not deployment destinations. GitHub `main` is source control, not a deployment.
An optimised frontend production build does not create a production environment.

| Service | Local address |
| --- | --- |
| Frontend | http://localhost:3000 |
| API | http://localhost:8005 |
| MySQL | 127.0.0.1:3306, database `hometruth` |
| Qdrant | http://localhost:6333 |

Old team server addresses and staging scripts are retired. Do not use archived
configuration or old tickets as connection instructions. Before introducing a
hosted environment, provision separate credentials and storage, verify backup
restoration, rehearse pending migrations on a database copy, and validate the
actual deployed versions. Never overwrite the local database during setup.

For a new checkout, copy `.env.example` to `.env`, install dependencies with
`npm ci`, and run `npm start`. Do not overwrite an existing environment file.
`npm run build` produces an optimised local artifact and does not deploy it.

Create React App gives shell variables and `.env.development.local` precedence
over `.env` during development. Review those overrides if an address differs.
The optional `start:branch-preview` script uses a separate local port and proxies
API requests to localhost:8005. Backend credentials never belong in frontend env
files. The legacy extension login link also opens localhost:3000.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Tickets

Tickets live in the standalone repo at `../HomeTruth-tickets`.

Reference ticket IDs in branch names, commit messages, pull requests, and implementation notes. Do not add a ticket checkout or submodule inside this repo.

All codebase changes must start from a ticket and include an implementation log
in that ticket. See `../HomeTruth-tickets/README.md` for the shared ways of
working.

## User flow blueprints

- [HT-FLOW-001 · First answer to home record](docs/user-flows/HT-FLOW-001.md)

## Local homeowner demo

The Buying, Improving and Selling question chooser is enabled by
`REACT_APP_HOMEPAGE_QUESTIONS=true`. The selected-home Control centre is
enabled by `REACT_APP_CONTROL_CENTRE_ENABLED=true`. A standard build leaves
these flags off.

To rehearse against the local HomeTruth backend, add the synthetic Maya
account to the frontend checkout’s ignored `.env.local`:

```sh
HOMETRUTH_LOCAL_MAYA_EMAIL=maya.demo@example.invalid
HOMETRUTH_LOCAL_MAYA_PASSWORD=<the local demo fixture password>
```

Then run this from the frontend checkout:

```sh
HOST=127.0.0.1 PORT=3014 BROWSER=none \
  HOMETRUTH_PREVIEW_API_PROXY=true REACT_APP_API_BASE_URL= \
  REACT_APP_HOMEPAGE_QUESTIONS=true REACT_APP_CONTROL_CENTRE_ENABLED=true \
  REACT_APP_HOMEOWNER_DEMO=true REACT_APP_LOCAL_APPLIANCE_FLOW=true npm start
```

- Open `/login?switch=1` and choose **Log in as Maya** to go to Control centre.
  Direct demo entry to equipment is at `/demo?to=appliances`.
- From **Appliances**, open the washer, then ask **get me my washing machine
  manual** in the top bar. An exact Vault match can be opened or linked to that
  appliance. A manufacturer lookup requires confirmation.
- The optional **Admin login · localhost only** shortcut needs
  `REACT_APP_LOCAL_ADMIN_LOGIN=true` and `HOMETRUTH_LOCAL_ADMIN_ENV_FILE` pointing
  to a private local env file with `LOCAL_ADMIN_EMAIL` and `LOCAL_ADMIN_PASSWORD`.
  At `/login?switch=1`, the shortcut uses the normal login API and opens
  `/admin/operations`. You can use it again while the explicitly configured
  loopback demo server is running.
- For a separate frontend rehearsal, set both `PORT` and
  `REACT_APP_LOCAL_DEMO_PORT` to the same free loopback port. The API proxy
  defaults to 8005 for core, 8015 for Ask and 8014 for appliances. For a single
  consolidated backend, point `HOMETRUTH_LOCAL_CORE_API_PORT`,
  `HOMETRUTH_LOCAL_ASK_API_PORT`, and `HOMETRUTH_LOCAL_ITEMS_API_PORT` to its port.
  `HOMETRUTH_LOCAL_SURVEY_API_PORT` can route Vault passages and follow-ups to a
  separate local backend while testing.

Use only synthetic data and the local development database. Keep fixture
credentials in private env files.

## Coming Soon Mode

This app includes a "Coming Soon" mode that blocks access to all routes and displays only the Coming Soon page until you're ready to launch.

### Setup

1. Create a `.env` file in the root directory of the project
2. Add the following line:
   ```
   REACT_APP_COMING_SOON=true
   ```
3. Restart your development server

### Switching Between Modes

- **Coming Soon Mode (Before Launch)**: Set `REACT_APP_COMING_SOON=true` in your `.env` file
  - All routes (/, /login, /register, etc.) will redirect to the Coming Soon page
  - Users cannot access any other parts of the application
  
- **Full Application (After Launch)**: Set `REACT_APP_COMING_SOON=false` in your `.env` file
  - All routes work normally
  - Users can access login, register, dashboard, etc.

**Important**: After changing the `.env` file, you must restart the development server for changes to take effect.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
