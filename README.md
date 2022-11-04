# netsuite-print

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


