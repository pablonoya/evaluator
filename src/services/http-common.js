import axios from "axios"

const apiInstance = axios.create(
  {
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
      Authorization:
        localStorage.getItem("accessToken") && "Bearer " + localStorage.getItem("accessToken"),
    },
  },
  error => Promise.reject(error)
)

apiInstance.interceptors.response.use(null, error => {
  if (
    [
      "/evaluator/api/token/",
      "/evaluator/api/users/change_password/",
      "/evaluator/api/users/search/",
    ].includes(error.config.url)
  ) {
    return Promise.reject(error)
  }

  if (error.config.url == "/evaluator/api/token/refresh/") {
    window.location.href = "/login/"
    return Promise.reject(error)
  }

  return new Promise((resolve, reject) => {
    if (error.response.status === 401) {
      let originalRequest = error.config

      let res = apiInstance
        .post("/evaluator/api/token/refresh/", {
          refresh: localStorage.getItem("refreshToken"),
        })
        .then(res => {
          localStorage.setItem("accessToken", res.data.access)

          const token = "Bearer " + res.data.access
          apiInstance.defaults.headers["Authorization"] = token
          originalRequest.headers["Authorization"] = token

          return axios.request(originalRequest)
        })
      return resolve(res)
    }
    reject(error)
  })
})

function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

export default apiInstance
