# Development Environment
This document describes how to set up your development
environment to work on The Misinformation Game and host
it locally for testing.

## 1. Install Dependencies
Similarly to when deploying the application, the NPM
dependencies for the project must be installed.
This can be done using the following commands from the
root directory of the project,
```shell
npm install
sudo npm install -g firebase-tools
npm run build
```

## 2. Run Firebase Emulator
The Firebase emulator will emulate the Firebase
authentication, Firestore, and Firebase Storage for
you. The emulator can be started by running the command,
```shell
firebase emulators:start
```

After you have run this command, you can access the
Firebase Emulator Suite backend at https://localhost:9000.
Every time you restart this emulator, all the data stored
within it will be discarded.

## 3. Run Development Website
While the Firebase Emulator provides its own hosting of
the website as well, using NPM to host the development
website is better, as it will update your website
instantly when you make changes. You can host your
development website using NPM by running the following
command,
```shell
npm start
```

You should now be able to access the development
website at https://localhost:3000. Any changes you make
to the source code should also be immediately reflected
in the page you are viewing.
