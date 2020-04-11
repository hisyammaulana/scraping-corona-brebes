const cheerio = require("cheerio");
const requestPromise = require("request-promise");
const bodyParser = require('body-parser');
const response = require('./../api/restApi');

exports.brebes = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    const coronaBrebes = [];
    const url = "http://corona.brebeskab.go.id/";
    const results = await getData(url);
    const $ = cheerio.load(results);
    const kasus = $("body .bg-red");
    const total_kasus = kasus
      .find("p")
      .eq(0)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");
    const dirawat = kasus
      .find("p")
      .eq(1)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");
    const sembuh = kasus
      .find("p")
      .eq(2)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");
    const meniggal = kasus
      .find("p")
      .eq(3)
      .text()
      .trim()
      .replace("\n", "")
      .replace(/\D/g, "");

    const odp = $("body .bg-green");
    const total_odp = odp
      .find("p")
      .eq(0)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");
    const sedang_pemantauan = odp
      .find("p")
      .eq(1)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");
    const sudah_pemantauan = odp
      .find("p")
      .eq(2)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");

    const pdp = $("body .bg-blue");
    const total_pdp = pdp
      .find("p")
      .eq(0)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");
    const dirawat_pdp = pdp
      .find("p")
      .eq(1)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");
    const pulang = pdp
      .find("p")
      .eq(2)
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "")
      .replace(/\D/g, "");

    const update = pdp
      .find(".progress-description")
      .text()
      .trim()
      .replace("\r\n\t\t\t\t\t", "")
      .replace("\r\n\t\t\t\t", "");
    const tanggal = update.substring(update.length - 10, update.length);

    coronaBrebes.push({
      konfirmasi: {
        total_kasus: total_kasus,
        dirawat: dirawat,
        sembuh: sembuh,
        meniggal: meniggal,
      },
      odp: {
        total_odp: total_odp,
        dalam_pemantauan: sedang_pemantauan,
        selesai_pemantauan: sudah_pemantauan,
      },
      pdp: { total_pdp: total_pdp, dirawat: dirawat_pdp, pulang: pulang },
      diperbaharui: tanggal,
    });

    const obj = coronaBrebes.reduce((a, b) => Object.assign(a, b), {});

    response.ok(obj, res);

    function getData(url) {
      return requestPromise.get(url, { strictSSL: false }, (err, body) => body);
    }
  }catch(e){
    response.failed(undefined,e, res)
  }
};
