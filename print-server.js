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
import ptp from 'pdf-to-printer';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import colors from 'colors';

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Use HTTP POST to print PDF file.");
})

app.post('/', (req, res) => {
    //console.log("body", req.body);
    let fileLocation = "temp";
    let fileName = req.body?.filename || "tempfile.pdf";
    let printerName = req.body?.printer || "HP LaserJet 4";
    let pdfData = req.body?.data;
    try {
        var pdfContent = Buffer.from(pdfData, 'base64');
        fs.writeFile(`./${fileLocation}/${fileName}`, pdfContent, function(err) {
            if (err) {
                console.log(`Error ${err.errno}:`.brightRed, `${err.code} - ${err.syscall} ${err.path}`.red.bold);
                confirmFailure(res, fileName, printerName);
                return;
            }
            console.log("Saved the file".green, fileName.white, "to".green, `/${fileLocation}`.green);
            const options = {
                printer: printerName,
            };
        /*  ptp.print(pdfFile, options)
            .then( function() { 
                confirmSuccess(res, fileName, printerName); 
                // Remove file from folder
                fs.unlinkSync(`./${fileLocation}/${fileName}`); 
            })
            .catch( function() {
                confirmFailure(res, fileName, printerName;
                // Remove file from folder
                fs.unlinkSync(`./${fileLocation}/${fileName}`); 
            ));  */
            
            // Remove file from folder
            fs.unlink(`./${fileLocation}/${fileName}`,(err) => {
                if(err) {
                    //console.log("failed to delete local image:" + err);
                    //console.log(JSON.stringify(err));
                    console.log(`Error ${err.errno}:`.brightRed, `${err.code} - ${err.syscall} ${err.path}`.red.bold);
                    confirmFailure(res, fileName, printerName);
                } else {
                    confirmSuccess(res, fileName, printerName);
                }
            });
        });
    }
    catch(err) {
        console.log(JSON.stringify(err));
        console.log(`Error ${err.code}:`.brightRed, err.error.red.bold);
        console.log("File:".brightRed,`${fileName}`.red.bold);
        confirmFailure(res, fileName, printerName);
    }
})

var confirmSuccess = function(res,fileName,printerName) {
    console.log("Printed".green, fileName.brightGreen.bold, "on".green, printerName.brightGreen.bold);
    console.log(" ");
    let response = {
        success: true,
        message: `Printing ${fileName} on ${printerName}`
    };
    res.send(response);
}
var confirmFailure = function(res,fileName,printerName) {
    console.log("Failed printing".brightRed, fileName.red.bold, "on".brightRed, printerName.red.bold);
    console.log(" ");
    let response = {
        success: false,
        message: `Failed printing ${fileName} on ${printerName}`
    };
    res.send(response);
}

app.listen(port, () => {
    console.log(" ");
    console.log("Wipfli Print Server".yellow,"v0.0.4".yellow, "listening on port".green, `${port}`.brightGreen);
    console.log("-------------------------------------------------".green);
})