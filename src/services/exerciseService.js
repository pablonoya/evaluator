import http from "./http-common"

class ExcerciseService {
  constructor() {
    this.url = "/evaluator/api/exercises/"
  }

  getAll(params) {
    return http.get(this.url, { params: params })
  }

  get(id) {
    return http.get(`${this.url}${id}/`)
  }

  getOutputs(id) {
    return http.get(`${this.url}${id}/get_outputs/`)
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

  getAllWithoutTask(params) {
    return http.get(`${this.url}get_all_without_task/`, { params: params })
  }

  lottery(data) {
    return http.post(`${this.url}lottery/`, data)
  }

  updateTask(data) {
    return http.put(`${this.url}update_task/`, data)
  }

  release(data) {
    return http.put(`${this.url}release/`, data)
  }

  submit(data) {
    return http.post(`${this.url}submit/`, data)
  }
}

export default new ExcerciseService()
