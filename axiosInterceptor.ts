import axios from "axios";
import Cookies from 'js-cookie';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
    function (config) {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('NO TOKEN');
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function (response) {
        // any status code that lie within the range of 2XX cause this function
        // to trigger
        return response;
    },
    function (error) {
        // any status codes that falls outside the range of 2xx cause this function
        // to trigger
        let res = error.response;
        console.log('ERROR', res);
        if ((res.status === 401 || res.status === 403) && res.config && !res.config.__isRetryRequest) {
            return new Promise((resolve, reject) => {
                window.location.href = '/login';
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
