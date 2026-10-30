# Gölge Şef

[Türkçe](README.md) | English

A Turkish browser-based political strategy game. Gather information, review evidence, and choose the candidate you want to support in a power struggle between three ministers. The game lasts seven days, and you have four action points (AP) each day.

## Technologies

JavaScript, Vite, HTML, and CSS. Tests use the Node.js test runner.

## Run the project

Node.js and npm are required.

```bash
npm ci
npm run dev
```

Open the address shown in the terminal in your browser.

## Test and build

```bash
npm test
npm run build
```

Build files are created in the `dist/` folder.

## Gameplay

Each operation starts with election strength between 30 and 56 and relationships between 20 and 75. Three different personalities are selected from a pool of six and assigned to the ministers. Each minister receives three different cases from a pool of eighteen incidents. Match the documents and decide whether the report is supported.

A leak first starts a source search. Blackmail reveals your identity immediately. Stopping an active investigation costs 2, 3, or 4 AP depending on the age of the file.

Version 0.4 saves use a separate storage key, so older saves are kept but are not migrated.

## Current status

The project is still in development. The game saves automatically in the browser. The Firebase connection adapter and Firestore rules are ready, but cloud saves are not active until the Firebase project is connected.

The interface includes a basic English mode. Turkish remains the default language.
