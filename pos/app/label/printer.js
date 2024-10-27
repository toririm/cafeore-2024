import { useEffect, useRef, useState } from "react";

/**
 *
 * @returns {{
 * connect: () => void,
 * status: "init" | "disconnected" | "connecting" | "connected",
 * addQueue: (text: string) => void,
 * addNumber: (num: number) => void,
 * print: () => void
 * }}
 */
export const usePrinter = () => {
  const [status, setConnStat] = useState("init");
  const ePosDeviceRef = useRef();
  const printerRef = useRef();

  useEffect(() => {
    if (status === "init") {
      connect();
    }
  }, [status]);

  const connect = () => {
    setConnStat("connecting");
    const ePosDev = new window.epson.ePOSDevice();
    ePosDeviceRef.current = ePosDev;

    ePosDev.connect("192.168.77.2", 8008, (data) => {
      if (data === "OK" || data === "SSL_CONNECT_OK") {
        ePosDev.createDevice(
          "local_printer",
          ePosDev.DEVICE_TYPE_PRINTER,
          { crypto: true, buffer: false },
          (devobj, retcode) => {
            if (retcode === "OK") {
              printerRef.current = devobj;
              setConnStat("connected");
            } else {
              setConnStat("disconnected");
              throw retcode;
            }
          },
        );
      } else {
        setConnStat("disconnected");
        console.log(data);
      }
    });
  };

  const addQueue = (text) => {
    const prn = printerRef.current;
    if (!prn) {
      setConnStat("disconnected");
      console.error("Printer not connected");
      return;
    }

    prn.addTextLang("ja");
    prn.addTextSize(2, 2);
    prn.addText(` ${text}`);
    prn.addFeedLine(5);
  };

  const addNumber = (num) => {
    const prn = printerRef.current;
    if (!prn) {
      setConnStat("disconnected");
      console.error("Printer not connected");
      return;
    }

    prn.addTextLang("ja");
    prn.addTextSize(5, 5);
    prn.addText(`No. ${num.toString()}\n`);
    prn.addTextSize(4, 4);
    prn.addText("--------\n");
  };

  const print = () => {
    const prn = printerRef.current;
    if (!prn) {
      setConnStat("disconnected");
      console.error("Printer not connected");
      return;
    }

    prn.send();
  };

  const printer = {
    connect,
    status,
    addQueue,
    addNumber,
    print,
  };

  return printer;
};
