export const run = async () => {
  const ePosDev = new window.epson.ePOSDevice();
  let printer = null;
  ePosDev.connect("192.168.77.2", 8008, cbConnect);
  console.log("start");
  function cbConnect(data) {
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
  }
  function cbCreateDevice_printer(devobj, retcode) {
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
  }

  function print() {
    printer.addFeedPosition(printer.FEED_NEXT_TOF);
    printer.addTextLang("ja");
    printer.addTextFont(printer.FONT_A);
    printer.addTextDouble(true, true);
    printer.addText("Hello\nWorld\nたけとハウス\nはっぴ～");
    printer.addFeedPosition(printer.FEED_CUTTING);
    printer.send();
  }
};
