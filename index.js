var express = require('express');
var cheerio = require('cheerio');
var requestPromise = require('request-promise');
var cors = require('cors');
var app = express();
var coronaBrebes = [];

app.use(cors({credentials: true, origin: true}));

app.get('/', async function (req, res) {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  const url = 'http://corona.brebeskab.go.id/'
  const results = await getData(url);
  const $ = cheerio.load(results);
  var kasus = $('body .bg-red');
  var total_kasus = kasus.find('p').eq(0).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
  var dirawat = kasus.find('p').eq(1).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
  var sembuh = kasus.find('p').eq(2).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
  var meniggal = kasus.find('p').eq(3).text().trim().replace('\n', '').replace(/\D/g,'');

  var odp = $('body .bg-green');
  var total_odp = odp.find('p').eq(0).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
  var sedang_pemantauan = odp.find('p').eq(1).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
  var sudah_pemantauan = odp.find('p').eq(2).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');

  var pdp = $('body .bg-blue');
  var total_pdp = pdp.find('p').eq(0).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
  var dirawat_pdp = pdp.find('p').eq(1).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
  var pulang = pdp.find('p').eq(2).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');

  var update = pdp.find('.progress-description').text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '');
  var tanggal = update.substring(update.length - 10, update.length);

  coronaBrebes.push({
    konfirmasi: {total_kasus: total_kasus, dirawat: dirawat,  sembuh: sembuh, meniggal: meniggal},
    odp : {total_odp : total_odp, dalam_pemantauan: sedang_pemantauan, selesai_pemantauan: sudah_pemantauan},
    pdp : {total_pdp : total_pdp, dirawat : dirawat_pdp, pulang : pulang},
    diperbaharui : tanggal
  })

  const obj = coronaBrebes.reduce((a, b) => Object.assign(a, b), {})

  res.send(JSON.stringify(obj));

  function getData(url){
    return requestPromise.get(url,{strictSSL: false}, (err,body) => body);
  }

});


//api tegal
app.get('/tegal', async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  const token = req.headers['authorization'];
  if(token !== 'RGlSdW1haEFqYVNheWFuZw=='){
    res.send(JSON.stringify({
      message: '401 Authorization',
      status: false
    }));
  }else {
    try {
      const url = 'http://covid19.tegalkab.go.id/'
      const results = await getData(url);
      const $ = cheerio.load(results);
      const content = $('body .content');

      const title = [];
      const total = [];
      const finish = [];
      const dataKec = [];
      const tableHeaders = [];
      const rsText = [];
      const monitoring = [];
      const details = [];



      $('body > section > div > div > div > div.inner > div > div.widget-user-header > center > h5 > strong').each((index, element) => {
        let text = $(element).text().replace(' (Pelaku Perjalanan)','').replace(' (Orang Tanpa Gejala)','').replace(' (Orang Dalam Pantauan)','').replace(' (Pasien Dalam Pengawasan)','');
        title.push(text)
      })
      $('body > section > div > div > div > div.inner > div > div.widget-user-header > center > h4 > strong').each((index, element) => {
        let text = $(element).text().replace('TOTAL','.').replace('.','');
        total.push(text);
      });

      $('body > section > div > div > div > div.inner > div > div.card-footer > div > div.col-sm-6.border-right > div > span').each((index, element) => {
        let text = $(element).text();
        finish.push(text)
      });

      $('body > section > div > div > div > div.inner > div > div.card-footer > div > div > div > span').each((index, element) => {
        let text = $(element).text();
        monitoring.push(text)
      });

      $('body > section > div > div > div > div.inner > div > div.card-footer > div > div > div > span').each((index, element) => {
        let text = $(element).text();
        details.push(text)
      });


        $('body > section > div > div.col-md-4 > div > div.panel-body > table > thead > tr').each((index, element) => {
        if (index === 0) {
          const ths = $(element).find("th");
           $(ths).each((i, element) => {
             tableHeaders.push($(element).text());
           });

            return true;
          }
      });



      $('body > section > div > div.col-md-4 > div > div.panel-body > table > tbody > tr').each((index, element) => {
          const tds = $(element).find('td');
          const tableRow = {};
          $(tds).each((i, element) => {
            tableRow[tableHeaders[i]] = $(element).text();
          });
          dataKec.push(tableRow);
      });

      $('body > section > div:nth-child(2) > div.col-md-3 > div > div.panel-body > div').each((index, element) => {
          const tds = $(element).find('h4');
          $(tds).each((i, element) => {
            rsText.push($(element).text().replace('- ',''));
          });
      });

      const update = $('body > center > font').text().replace('Update : ','');

      const rsData = rsText.map(r => r.substring(3)).filter((r,i) => i >= 0 && i <= 4 );
      const rsKet = rsText.filter((r,i) => i >= 6 && i <= 9);

      const totalData = total.filter(t => t !== '');
      const dataMonitoring = monitoring.filter((m,i) => i === 1 || i === 3 || i === 5);

      const detailData = details.filter((d,i) => i > 5);

      const data = [];
      title.map((r,i) => {
        if(i < 3) {
          data.push({[r] : {
            total: totalData[i],
            selesai : finish[i],
            pantauan: dataMonitoring[i]
            }
          })
        }else {
          data.push({[r] : {
            total: totalData[i],
            sembuh: i === 3 ? detailData[0] : detailData[3],
            dirawat: i === 3 ? detailData[1] : detailData[4],
            meniggal: i === 3 ? detailData[2] : detailData[5]
            }
          })
        }
      })

      resultData = Object.assign({}, ...data.map((d,i) => d ))

      res.send(JSON.stringify({
        message: 'success',
        status: true,
        data:
        resultData,
        kecamatan: dataKec,
        rs: {
          data : rsData,
          keterangan : rsKet
        },
        updated: update
      }));
    } catch (e) {
      console.log(e);
      res.send(JSON.stringify({
        message: 'failed',
        status: false
      }));
    }
  }

  function getData(url){
    return requestPromise.get(url,{strictSSL: false}, (err,body) => body);
  }
});

var port = process.env.PORT || 2000;
app.listen(port, function () {
  console.log('listening on port ' + port);
});
