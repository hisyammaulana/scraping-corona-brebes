const express = require("express");
const cheerio = require("cheerio");
const app = express();
const port = process.env.PORT || 2000;
const route = require('./routes/route');

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: "Corona Open API District Brebes & District Tegal",
        description: "Information About Corona API in Brebes & Tegal. Thanks to [KawalCoronaAPI](https://kawalcorona.com/) and [PomberAPI](https://github.com/pomber/covid19/)",
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
        contact: {
          name: "PLUGIN Developer",
        },
        version: "v.1.0.0",
        servers: "https://api-corona-brebes.herokuapp.com",
        securityDefinitions: {
          Authorization: {
            type: "apiKey",
            name: "Authorization",
            scheme: "",
            in: "header",
          },
        },
        schemes: -"https" - "http",
      },
    },
    apis: ["index.js"],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/openAPI", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // Routes
  /**
   * @swagger
   * /brebes:
   *  get:
   *    description: Use to request all API in Brebes
   *    responses:
   *      '200':
   *        description: A successful response
   *    consumes:
   *        - application/json
   *        - application/xml
   *    produces:
   *        - application/json
   *        - application/xml
   */

  /**
   * @swagger
   * /tegal:
   *  get:
   *    parameters:
   *    - in: header
   *      name: Authorization
   *      required: false
   *      type: string
   *      format: string
   *    description: Use to request all API in Tegal
   *    responses:
   *      '200':
   *        description: A successful response
   *    consumes:
   *        - application/json
   *        - application/xml
   *    produces:
   *        - application/json
   *        - application/xml
   */

  app.get('/',function (req, res) { res.redirect('/openAPI') } );

route(app);

app.listen(port, function () {
  console.log("listening on port " + port);
});
