# netsuite-print

- All requests need authentication.
- Server supports Basic Auth. Please make sure to use https to protect user credentials.
- To setup Auth.
   - Rename the file `.env-exmaple` to `.env`.
   - Set `AUTH_USERNAME` and `AUTH_PASSWORD` variable.

## Payload Format

    {
        "printer": <printername>,
        "filename": <filename.pdf>,   // Optional
        "data" : <PDF file encoded as Base64>
    }


## Sample Payload

    {
        "printer": "Brother MFC-L2700DW">,
        "filename": "18487_163_cutsheet.pdf",   // Optional
        "data" : "JVBERi0xLjMKJd/++LIKMS...3MTgKJSVFT0YK"
    }
