'use client'

import { Button, Form, FormProps, Input } from 'antd';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Illustration
import axiosInstance from '@/axiosInterceptor';
import CoffeeIllustration from '@/public/img/coffee-farmer.svg';

export default function OnboardingPage() {

    // Butotn loading hook
    const [loading, setLoading] = useState<boolean>(false);
    const [userID, setUserID] = useState<number | null>(null);


    const OnFinish: FormProps<Farm>['onFinish'] = async (values) => {
        if (!userID) return;

        setLoading(true);
        // Send data to API
        const form: FormData = new FormData();
        form.append('UserID', userID.toString());
        form.append('Name', values.name);
        form.append('Address', values.address);
        form.append('Hectares', values.hectares.toString());

        try {
            const res = await axiosInstance.post("/api/Farm", form);
            setLoading(false);
            window.location.href = "/dashboard";
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    }

    const OnFinishFailed: FormProps<Farm>['onFinishFailed'] = (errorInfo) => {
        console.log(errorInfo);
    }

    //=== UseEffects ===//
    useEffect(() => {
        // Set user cookies
        const userCookie = Cookies.get("user");
        if (userCookie) {
            const user = JSON.parse(userCookie);
            setUserID(user.userID);
        }

    }, []);


    return (
        <div className="w-screen lg:h-full flex flex-col lg:flex-row justify-center items-center gap-8 p-8">
            <div className='lg:w-1/2 h-full flex justify-center'>
                <Image src={CoffeeIllustration} alt="Coffee Farmer" />
            </div>
            <div className="lg:w-1/2 flex flex-col gap-12 lg:px-8">
                <div className='flex flex-col gap-4'>
                    <h1 className="text-brown text-3xl lg:text-4xl font-extrabold">Empecemos registrando tu finca</h1>
                    <p className="text-brown text-sm lg:text-base">
                        Agrega a continuación los datos de tu finca para comenzar a usar la plataforma.&nbsp;
                        <b>Podrás cambiar la información o agregar más fincas posteriormente.</b>
                    </p>
                </div>

                <Form
                    name="onboarding"
                    className="w-full"
                    labelWrap
                    layout='vertical'
                    size='large'
                    onFinish={OnFinish}
                    onFinishFailed={OnFinishFailed}
                >
                    <Form.Item
                        label="Nombre de la finca"
                        name="name"
                        rules={[{ required: true, message: 'Por favor ingresa el nombre de tu finca' }]}
                    >
                        <Input type="text" />
                    </Form.Item>

                    <Form.Item
                        label="Dirección"
                        name="address"
                        rules={[{ required: true, message: 'Por favor ingresa la dirección de tu finca' }]}
                    >
                        <Input type="text" />
                    </Form.Item>

                    <Form.Item
                        label="Tamaño de la finca en hectáreas"
                        name="hectares"
                        rules={[{ required: true, message: 'Por favor ingresa el tamaño de tu finca' }]}
                    >
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item className='w-full flex lg:justify-end'>
                        <Button type="primary" htmlType="submit" className='w-full lg:w-auto mt-5' loading={loading}>
                            Registrar
                        </Button>
                    </Form.Item>
                </Form>

            </div>
        </div>
    )
}