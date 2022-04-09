import http from "./http-common"

class ReportsService {
  constructor() {
    this.url = "/evaluator/api/reports"
  }

  get(url, params) {
    return http.get(this.url + url + "/", { params: params })
  }
}

export default new ReportsService()
