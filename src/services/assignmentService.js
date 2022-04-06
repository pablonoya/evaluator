import http from "./http-common"

class AssignmentService {
  constructor() {
    this.url = "/evaluator/api/assignments/"
  }

  create(data) {
    return http.post(this.url, data)
  }

  update(id, data) {
    return http.put(this.url + id + "/", data)
  }
}

export default new AssignmentService()
