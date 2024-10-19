/**
 *
 * @param {ItemEntity[]} items
 */
export const printLabel = (items) => {
  const ePosDev = new window.epson.ePOSDevice();
  let printer = null;

  const cbConnect = (data) => {
    if (data === "OK" || data === "SSL_CONNECT_OK") {
      ePosDev.createDevice(
        "local_printer",
        ePosDev.DEVICE_TYPE_PRINTER,
        { crypto: false, buffer: false },
        cbCreateDevice_printer,
      );
    } else {
      console.log(data);
    }
  };
  const cbCreateDevice_printer = (devobj, retcode) => {
    if (retcode === "OK") {
      printer = devobj;
      printer.timeout = 60000;
      printer.onreceive = (res) => {
        console.log(res.success);
      };
      printer.oncoveropen = () => {
        console.log("coveropen");
      };
      print();
    } else {
      console.log(retcode);
    }
  };

  /**
   *
   * @param {ItemEntity} item
   */
  const print = (item) => {
    printer.addFeedPosition(printer.FEED_NEXT_TOF);
    printer.addTextLang("ja");
    printer.addTextFont(printer.FONT_A);
    printer.addTextDouble(true, true);
    printer.addText(item.name);
    printer.addFeedPosition(printer.FEED_CUTTING);
    printer.addCut(printer.CUT_FEED);
    printer.send();
  };

  ePosDev.connect("192.168.77.2", 8008, cbConnect);

  for (const item of items) {
    print(item);
  }
};
