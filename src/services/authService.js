import http from "./http-common"

const noAuthHeader = {
  headers: {
    Authorization: null,
  },
}
class AuthService {
  constructor() {
    this.url = "/evaluator/api"
  }

  search(username) {
    return http.post(`${this.url}/users/search/`, { username: username }, noAuthHeader)
  }

  recoverPassword(body) {
    return http.post(`${this.url}/users/recover_password/`, body, noAuthHeader)
  }

  changePassword(password) {
    return http.put(`${this.url}/users/change_password/`, { password: password })
  }

  login(data) {
    return http.post(`${this.url}/token/`, data)
  }

  myself() {
    return http.get(`${this.url}/users/myself/`)
  }

  generatePassword(id) {
    return http.get(`${this.url}/users/${id}/generate_password/`)
  }

  updateProfile(data) {
    return http.post(`${this.url}/users/update_profile/`, data)
  }
}

export default new AuthService()
