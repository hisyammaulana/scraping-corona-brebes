var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var app = express();
var coronaBrebes = [];

app.get('/', function (req, res) {
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  
  
  request({
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

      var pdp = $('body .bg-aqua');
      var total_pdp = pdp.find('p').eq(0).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
      var dirawat_pdp = pdp.find('p').eq(1).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');
      var pulang = pdp.find('p').eq(2).text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').replace(/\D/g,'');

      var update = pdp.find('.small-box-footer').text().trim().replace('\r\n\t\t\t\t\t', '').replace('\r\n\t\t\t\t', '').slice(10);

      coronaBrebes.push({
        konfirmasi: {total_kasus: total_kasus, dirawat: dirawat,  sembuh: sembuh, meniggal: meniggal},
        odp : {total_odp : total_odp, dalam_pemantauan: sedang_pemantauan, selesai_pemantauan: sudah_pemantauan},
        pdp : {total_pdp : total_pdp, dirawat : dirawat_pdp, pulang : pulang},
        diperbaharui : update
      })
  });

  var coronaArray = coronaBrebes

  var coronaObj = coronaArray.reduce((a, b) => Object.assign(a, b), {})
  
  res.send(JSON.stringify(coronaObj));
});

var port = process.env.PORT || 2000;
app.listen(port, function () {
  console.log('listening on port ' + port);
});
