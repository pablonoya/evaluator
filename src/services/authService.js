import http from "./http-common"

class AuthService {
  constructor() {
    this.url = "/evaluator/api"
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
