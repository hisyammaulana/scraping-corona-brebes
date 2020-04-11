const cheerio = require("cheerio");
const requestPromise = require("request-promise");
const bodyParser = require('body-parser');
const response = require('./../api/restApi');

exports.kabTegal = async function(req, res){
  try {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");

      const token = req.headers["authorization"];
    if (token !== "RGlSdW1haEFqYVNheWFuZw==") {
        response.failed("401 Not Authorization",undefined, res);
    } else {

    const url = "http://covid19.tegalkab.go.id/";
    const results = await getData(url);
    const $ = cheerio.load(results);
    const content = $("body .content");

    const title = [];
    const total = [];
    const finish = [];
    const dataKec = [];
    const tableHeaders = [];
    const rsText = [];
    const monitoring = [];
    const details = [];

    $("body > section > div > div > div > div.inner > div > div.widget-user-header > center > h5 > strong").each((index, element) => {
      let text = $(element).text().replace(" (Pelaku Perjalanan)", "").replace(" (Orang Tanpa Gejala)", "").replace(" (Orang Dalam Pantauan)", "").replace(" (Pasien Dalam Pengawasan)", "");
      title.push(text);
    });
    $("body > section > div > div > div > div.inner > div > div.widget-user-header > center > h4 > strong").each((index, element) => {
      let text = $(element).text().replace("TOTAL", ".").replace(".", "");
      total.push(text);
    });

    $("body > section > div > div > div > div.inner > div > div.card-footer > div > div.col-sm-6.border-right > div > span").each((index, element) => {
      let text = $(element).text();
      finish.push(text);
    });

    $("body > section > div > div > div > div.inner > div > div.card-footer > div > div > div > span").each((index, element) => {
      let text = $(element).text();
      monitoring.push(text);
    });

    $("body > section > div > div > div > div.inner > div > div.card-footer > div > div > div > span").each((index, element) => {
      let text = $(element).text();
      details.push(text);
    });

    $("body > section > div > div.col-md-4 > div > div.panel-body > table > thead > tr").each((index, element) => {
      if (index === 0) {
        const ths = $(element).find("th");
        $(ths).each((i, element) => {
          tableHeaders.push($(element).text());
        });
        return true;
      }
    });

    $("body > section > div > div.col-md-4 > div > div.panel-body > table > tbody > tr").each((index, element) => {
      const tds = $(element).find("td");
      const tableRow = {};
      $(tds).each((i, element) => {
        tableRow[tableHeaders[i]] = $(element).text();
      });
      dataKec.push(tableRow);
    });

    $("body > section > div:nth-child(2) > div.col-md-3 > div > div.panel-body > div").each((index, element) => {
      const tds = $(element).find("h4");
      $(tds).each((i, element) => {
        rsText.push($(element).text().replace("- ", ""));
      });
    });

    const update = $("body > center > font").text().replace("Update : ", "");

    const rsData = rsText
      .map((r) => r.substring(3))
      .filter((r, i) => i >= 0 && i <= 4);
    const rsKet = rsText.filter((r, i) => i >= 6 && i <= 9);

    const totalData = total.filter((t) => t !== "");
    const dataMonitoring = monitoring.filter(
      (m, i) => i === 1 || i === 3 || i === 5
    );

    const detailData = details.filter((d, i) => i > 5);

    const data = [];
    title.map((r, i) => {
      if (i < 3) {
        data.push({
          [r]: {
            total: totalData[i],
            selesai: finish[i],
            pantauan: dataMonitoring[i],
          },
        });
      } else {
        data.push({
          [r]: {
            total: totalData[i],
            sembuh: i === 3 ? detailData[0] : detailData[3],
            dirawat: i === 3 ? detailData[1] : detailData[4],
            meniggal: i === 3 ? detailData[2] : detailData[5],
          },
        });
      }
    });

    resultData = Object.assign({}, ...data.map((d, i) => d));

    response.ok(
      {...resultData,
         kecamatan: dataKec,
         rs: {data: rsData, keterangan: rsKet},
         updated: update
       }, res);

     }

  } catch (e) {
    console.log(e);
    response.failed(undefined,e, res)
  }

  function getData(url) {
    return requestPromise.get(url, { strictSSL: false }, (err, body) => body);
  }
}
