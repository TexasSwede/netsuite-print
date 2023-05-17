/**
* netsuite-printer
* 
* This is a middleware script to run locally on a server on your network (within your firewall).
* The server needs to have a public IP address, or port forwarding, so it can be accessed
* from the NetSuite cloud servers. The computer/server on which this middleware code is running 
* needs to have network printers mapped for them to be able to be printed to from NetSuite.
* 
* Copyright (c) 2021 Karl-Henry Martinsson
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
* and associated documentation files (the "Software"), to deal in the Software without restriction, 
* including without limitation the rights to use, copy, modify, merge, publish, distribute, 
* sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
* BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
* DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import http from 'http';
import https from 'https';
import ptp from 'pdf-to-printer';
import nodePrinter from '@thiagoelg/node-printer';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import colors from 'colors';        // Note: Using safe version 1.4.0

const router = express.Router();
const app = express();
const port = 443;
const certPath = './certs'; // Location of SSL certificates

app.use(express.json());

const handleResponse = (res, data) => {
    res.status(200).send(data);
}
const handleError = (res, err) => res.status(500).send(err);

/*
process.on('uncaughtException', err => {
  console.log(`Uncaught Exception: ${err.message}`)
  process.exit(1)
}) */

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send("Use HTTPS POST to print PDF file.");
});

app.get('/printers', await list);

async function list(request, response) {
    function onSuccess(data) {
        response.send({ data });
    }

    function onError(error) {
        console.log(`error - ${error}`);
        response.send({ status: "error", error });
    }
    let prn = await ptp.getPrinters();
    let printers = [];
    for (let i = 0; i < prn.length; i++) {
        if (prn[i].name.indexOf("Microsoft") < 0) {
            printers.push(prn[i].name);
        }
    }
    printers = printers.sort();
    response.send(printers);
}

app.post('/', (req, res) => {
    let body = req.body;
    let fileLocation = "temp";
    let printerName = body?.printer || "Canon Seville";
    let format = body?.format || "PDF";
    let fileName = body?.filename || "tempfile." + format.toLowerCase();
    let printData = body?.data;

    try {
        let printContent = '';
        if (format.toUpperCase() == "PDF") {
            printContent = Buffer.from(printData, 'base64');
        } else {
            printContent = printData;
        }
        let printFileName = `./${fileLocation}/${fileName}`;
        fs.writeFile(printFileName, printContent, function (err) {
            if (err) {
                console.log(` Error ${err.errno}:`.brightRed, `${err.code} - ${err.syscall} ${err.path}`.red.bold);
                confirmFailure(res, fileName, printerName);
                return;
            }
            console.log(" Saved the file".green, fileName.white, "to".green, `/${fileLocation}`.green);
            if (format.toUpperCase() == "PDF") {
                const options = {
                    printer: printerName,
                };
                ptp.print(printFileName, options)
                    .then(function () {
                        confirmSuccess(res, fileName, printerName);
                        // Delete temporary file from folder
                        deleteFile(printFileName);
                    })
                    .catch(function (err) {
                        console.log(JSON.stringify(err));
                        // Delete file from folder
                        deleteFile(printFileName);
                        confirmFailure(res, fileName, printerName);
                        return;
                    });
            } else {
                nodePrinter.printDirect({
                    data: printData, printer: printerName, type: "RAW",
                    success: function () {
                        confirmSuccess(res, fileName, printerName);
                        // Delete file from folder
                        deleteFile(printFileName);
                    },
                    error: function (err) {
                        console.log(err);
                        // Delete file from folder
                        deleteFile(printFileName);
                        confirmFailure(res, fileName, printerName);
                        return;
                    }
                });
            }
        });
    } catch (err) {
        console.log(JSON.stringify(err));
        console.log(` Error ${err.code}:`.brightRed, `${err.error}`.red.bold);
        console.log(" File:".brightRed, `${fileName}`.red.bold);
        confirmFailure(res, fileName, printerName);
        return;
    }
});

const deleteFile = function (fileName) {
    try {
        fs.unlinkSync(fileName);
        return true;
    } catch (error) {
        console.log(" Failed to delete temporary file".brightRed, fileName.red.bold);
        return false;
    }
};

const confirmSuccess = function (res, fileName, printerName) {
    console.log(" Printed".green, fileName.brightGreen.bold, "on".green, printerName.brightGreen.bold);
    console.log(" ");
    let response = {
        success: true,
        message: `Printing ${fileName} on ${printerName}`
    };
    res.send(response);
};

const confirmFailure = function (res, fileName, printerName) {
    console.log(" Failed printing".brightRed, fileName.red.bold, "on".brightRed, printerName.red.bold);
    console.log(" ");
    let response = {
        success: false,
        error: {
            code: "PRINT_FAILED",
            message: `Failed printing ${fileName} on ${printerName}`
        }
    };
    res.send(response);
};

var privateKey = fs.readFileSync(`${certPath}/wildcard_valleycabinetinc_com.key`, 'utf8');
var certificate = fs.readFileSync(`${certPath}/wildcard_valleycabinetinc_com.crt`, 'utf8');
var ca = fs.readFileSync(`${certPath}/valleycabinetinc.ca-bundle`, 'utf8');

https.createServer({
    requestCert: true,
    rejectUnauthorized: false,
    ca: ca,
    key: privateKey,
    cert: certificate
}, app).listen(port, () => {
    console.log('\x1Bc'); // Clear screen
    console.log(" Wipfli Print Server".yellow, "v0.4.1".yellow, "listening on port".green, `${port}`.brightGreen);
    console.log(" -------------------------------------------------".green);
});
