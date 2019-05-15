// @flow
import { promisify } from "util";
import { Router as router } from "express";
import { wrap } from "async-middleware";
import request from "request";
import { validateParameters } from "../../middlewares";
import errorHandler from "../../utils/errorHandler";
import loadEnv from "../../utils/loadEnv";
import { getCityByKey, getProvinceByKey } from "../../utils/citiesData";
import { getAzanTimes } from "../../utils/bodySelectors";
import type { AzanObjectType } from "../../utils/bodySelectors/getAzanTimes";

const route = router();
const promisifyRequest = promisify(request);

export type AzanRequestType = express$Request & {
  query: {
    province: string,
    city: string
  }
};

route.get(
  "/",
  validateParameters("query", ["province", "city"]),
  wrap((req: AzanRequestType, res: express$Response): Promise<void> => {
    const { province, city } = req.query;

    const url = `${loadEnv(
      "TIME_IR_MAIN_URL"
    )}/fa/main?province=${+province}&city=${+city}`;

    return promisifyRequest(url)
      .then((response: { statusCode: number, body: string }) =>
        getAzanTimes(response.body).then((azanTimes: AzanObjectType) => {
          const provinceName = getProvinceByKey(province.toString())[0];
          const cityName = getCityByKey(
            province.toString(),
            city.toString()
          )[0];

          res.json({
            provinceName: provinceName.name,
            cityName: cityName.name,
            times: azanTimes
          });
        })
      )
      .catch(() => errorHandler(res));
  })
);

export default route;
