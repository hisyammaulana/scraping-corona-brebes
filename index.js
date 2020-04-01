var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var requestPromise = require('request-promise');
var cors = require('cors')
var app = express();
var coronaBrebes = [];

app.use(cors());

app.get('/', async function (req, res) {

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');


  await request({
    method: 'GET',
    url: 'http://corona.brebeskab.go.id/'
    }, function(err, response, body, callback) {
      if (err) return console.error(err);

      $ = cheerio.load(body);

      if(coronaBrebes.length > 0){
        coronaBrebes = [];
      }

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
  });

  var coronaArray = coronaBrebes

  var coronaObj = coronaArray.reduce((a, b) => Object.assign(a, b), {})

  res.send(JSON.stringify(coronaObj));
});


//api tegal
app.get('/tegal', async function (req, res) {

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

      const text = [];
      const num = [];
      const dataKec = [];
      const tableHeaders = [];
      const rsText = [];

      content.find('div .inner p').each(function (i){ text[i] = $(this).text() });
      content.find('div .inner h3').each(function (i){ num[i] = $(this).text().trim().replace(/  +/g, ' ') });
      $('body > section > div > div.col-md-4 > div > div.panel-body > table > thead > tr').each((index, element) => {
        if (index === 0) {
          const ths = $(element).find("th");
           $(ths).each((i, element) => {
             tableHeaders.push(
               $(element)
                 .text()
             );
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
      const rsKet = rsText.filter((r,i) => i >= 6 && i <= 10);


      const confirm = Object.assign(...text.map((t,i) => ({[t] : +num[i]}) ));
      const fixConfirm = Object.assign({}, confirm,{'PDP SEMBUH' : +num[text.length]},{'CONFIRM SEMBUH' : +num[text.length+1]});

      res.send(JSON.stringify({
        message: 'success',
        status: true,
        data: {
          konfirmasi: fixConfirm,
          kecamatan: dataKec,
          rs: {
            data : rsData,
            keterangan : rsKet
          },
          updated: update
        }
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
