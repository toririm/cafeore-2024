import { useRef, useState } from "react";

export const usePrinter = () => {
  const [connStat, setConnStat] = useState("disconnected");
  const ePosDevice = useRef();
  const printer = useRef();

  const connect = () => {
    setConnStat("connecting");
    const ePosDev = new window.epson.ePOSDevice();
    ePosDevice.current = ePosDev;

    ePosDev.connect("192.168.77.2", 8008, (data) => {
      if (data === "OK" || data === "SSL_CONNECT_OK") {
        ePosDev.createDevice(
          "local_printer",
          ePosDev.DEVICE_TYPE_PRINTER,
          { crypto: true, buffer: false },
          (devobj, retcode) => {
            if (retcode === "OK") {
              printer.current = devobj;
              setConnStat("connected");
            } else {
              throw retcode;
            }
          },
        );
      } else {
        console.log(data);
      }
    });
  };

  const addQueue = (text) => {
    const prn = printer.current;
    if (!prn) {
      console.error("Printer not connected");
      return;
    }

    prn.addTextLang("ja");
    prn.addTextDouble(true, true);
    prn.addText(` ${text}`);
    prn.addFeedLine(6);
  };

  const print = () => {
    const prn = printer.current;
    if (!prn) {
      console.error("Printer not connected");
      return;
    }

    prn.send();
  };

  const addFeed = () => {
    const prn = printer.current;
    if (!prn) {
      console.error("Printer not connected");
      return;
    }

    prn.addFeedLine(6);
    prn.send();
  };

  return { connect, connStat, addQueue, addFeed, print };
};

/**
 *
 * @param {string[]} texts
 */
export const printLabel = (texts) => {
  const ePosDev = new window.epson.ePOSDevice();
  const prn = null;

  /**
   *
   * @param {string} text
   */

  ePosDev.connect("192.168.77.2", 8008, cbConnect);

  for (const text of texts) {
    print(text);
  }
};
