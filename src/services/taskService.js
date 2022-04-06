import http from "./http-common"

class TaskService {
  constructor() {
    this.url = "/evaluator/api/tasks/"
  }

  getAll(params) {
    return http.get(this.url, { params: params })
  }

  get(id) {
    return http.get(`${this.url + id}/`)
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

  release(id, data) {
    return http.put(`${this.url + id}/release/`, data)
  }
}

export default new TaskService()
