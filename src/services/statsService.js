import http from "./http-common"

class StatsService {
  constructor() {
    this.url = "/evaluator/api/stats"
  }

  get(url, params) {
    return http.get(this.url + url + "/", { params: params })
  }
}

export default new StatsService()
