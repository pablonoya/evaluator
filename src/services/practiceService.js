import http from "./http-common"

class PracticeService {
  constructor() {
    this.url = "/evaluator/api/practices/"
  }

  getAll(params) {
    return http.get(`${this.url}`, { params: params })
  }
}

export default new PracticeService()
