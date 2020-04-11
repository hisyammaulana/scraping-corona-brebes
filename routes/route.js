'use strict';
const cors = require('cors');

module.exports = function(app) {
    const routeTegal = require('./../region/tegal');
    const routeBrebes = require('./../region/brebes');


    app.use(cors({ credentials: true, origin: true }));

    // app.get('/', function (req, res) { res.redirect('/openAPI') });

    app.route('/tegal').get(routeTegal.kabTegal);
    app.route('/brebes').get(routeBrebes.brebes);
    // app.route('/').get();

    app.route('*').get((req, res) => {
      res.status(200).json({
          message: 'not Found',
          status: false
        })
    })
};
