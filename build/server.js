"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fs = require("node:fs");
const sqlite3 = require("sqlite3");
const url = require("node:url");
// set up express web server
const app = express();
// set up static content
app.use(express.static('public'));
// open database
const DATABASE_URL = url.pathToFileURL('production.sqlite3').toString();
console.log(new URL(DATABASE_URL).pathname.slice(1));
const db = new sqlite3.Database(new URL(DATABASE_URL).pathname);
// last known count
let count = 0;
// Main page
app.get('/', async (_request, response) => {
    // increment count, creating table row if necessary
    await new Promise((resolve, reject) => {
        ;
        db.get('SELECT "count" from "welcome"', (err, row) => {
            let query = 'UPDATE "welcome" SET "count" = ?';
            if (err) {
                reject(err);
                return;
            }
            else if (row) {
                count = row.count + 1;
            }
            else {
                count = 1;
                query = 'INSERT INTO "welcome" VALUES(?)';
            }
            db.run(query, [count], err => {
                err ? reject(err) : resolve();
            });
        });
    });
    // render HTML response
    try {
        const content = fs.readFileSync('views/index.tmpl', 'utf-8')
            .replace('@@COUNT@@', count.toString());
        response.set('Content-Type', 'text/html');
        response.send(content);
    }
    catch (error) {
        response.send();
    }
});
// Ensure welcome table exists
db.run('CREATE TABLE IF NOT EXISTS "welcome" ( "count" INTEGER )');
// Start web server on port 3000
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
