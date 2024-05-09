'use client'
import axios from 'axios';
import React from 'react';

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import router from 'next/router';

export function useAuth() {
    const [auth, setAuth] = React.useState();


    axios.interceptors.request.use(
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

    axios.interceptors.response.use(
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
            if (res.status === 401 && res.config && !res.config.__isRetryRequest) {
                return new Promise((resolve, reject) => {
                    axios
                        .get('/api/logout')
                        .then((data) => {
                            console.log('/401 error > logout');
                            dispatch({ type: 'LOGOUT' });
                            window.localStorage.removeItem('user');
                            router.push('/login');
                        })
                        .catch((err) => {
                            console.log('AXIOS INTERCEPTORS ERR', err);
                            reject(error);
                        });
                });
            } else if (res.status === 403) {
                router.push('/login');
            }
            return Promise.reject(error);
        }
    );


    // useEffect(() => {
    //   const getCsrfToken = async () => {
    //     const { data } = await axios.get('/api/csrf-token');
    //     // console.log('CSRF', data);
    //     axios.defaults.headers['X-CSRF-Token'] = data.getCsrfToken;
    //   };
    //   getCsrfToken();
    // }, []);

    const getVerifiedtoken = async () => {    // Add authorization token to every request

        let token = Cookies.get('token') ?? null;
        if (token && token !== null) {
            token = jwtDecode(token);
        }
        // const verifiedToken = await verifyJwtToken(token);
        // setAuth(verifiedToken);
        setAuth(token);
    };
    React.useEffect(() => {
        getVerifiedtoken();
        return auth;
    }, []);

    return auth;

}