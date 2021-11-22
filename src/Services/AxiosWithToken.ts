import axios from 'axios'

// axios.defaults.transformRequest = axios.defaults.transformRequest


export default axios.create({
    baseURL:"http://localhost:8080/",
    headers:{
        'Content-Type':'application/json; charset=utf-8'
    },
    transformRequest: [
        (data, headers) => {
          const token = localStorage.getItem("userToken");
          if (token) {
            headers.common.Authorization = `Bearer ${token}`;
          } else {
            console.log("Cade o KCT do login");
          }
          return JSON.stringify(data);
        }
    ],
})