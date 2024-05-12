'use client'

import Cookies from 'js-cookie';

import CoffeeIllustration from '@/public/img/coffee-farmer.svg';
import Image from 'next/image';

export default function OnboardingPage() {


    return (
        <div className="w-screen h-full flex flex-col lg:flex-row justify-center items-center gap-12 p-8">
            <div className='w-1/2 flex justify-center'>
                <Image src={CoffeeIllustration} alt="Coffee Farmer" />
            </div>
            <div className="w-1/2 flex flex-col gap-4">
                <h1 className="text-brown text-4xl font-extrabold">Empecemos registrando tu finca</h1>
                <p className="text-brown ">
                    Agrega a continuación los datos de tu finca para comenzar a usar la plataforma.

                    <b>Podrás cambiar la información o agregar más fincas posteriormente.</b>
                    
                    {Cookies.get('user')}
                </p>
            </div>
        </div>
    )
}