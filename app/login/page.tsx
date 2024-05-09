'use client'

import { useAuth } from '@/hooks/useAuth';
import type { FormProps } from 'antd';
import { Button, Form, Input } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';

type AuthForm = {
    userName: string;
    password: string;
}

export default function Page() {

    // auth
    const auth = useAuth();

    // Avoid interceptor 
    const axiosInstance = axios.create();


    const onFinishLogin: FormProps<AuthForm>['onFinish'] = async (values) => {

        try {
            const form: FormData = new FormData();

            if (values?.userName.includes('@')) {
                form.append('Email', values.userName);
            }
            else {
                form.append('UserName', values.userName);
            }

            form.append('Password', values.password);

            const { data }: { data: AuthResponse } = await axiosInstance.post('/api/Auth/Login', form);

            console.log('Success:', data);

            // Set cookies
            Cookies.set('token', data.token);
            Cookies.set('user', JSON.stringify(data));

            window.location.href = '/dashboard';

        } catch (error) {
            console.log('Failed:', error);
        }

    };

    const onFinishLoginFailed: FormProps<AuthForm>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    return (
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinishLogin}
            onFinishFailed={onFinishLoginFailed}
        >
            <Form.Item
                label="Username or email"
                name="userName"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>

    );

}