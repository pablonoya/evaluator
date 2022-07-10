import http from "./http-common"

class TestcaseService {
  constructor() {
    this.url = "/evaluator/api/testcases/"
  }

  create(data) {
    return http.post(this.url, data)
  }

  update(id, data) {
    return http.put(`${this.url + id}/`, data)
  }

  delete(id) {
    return http.delete(`${this.url + id}/`)
  }

  upload(data) {
    return http.post(this.url + "upload/", data, {
      headers: { "content-type": "multipart/form-data" },
    })
  }
}

export default new TestcaseService()
