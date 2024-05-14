'use client'

import NavBar from "@/components/navBar/navBar";
import TopBar from "@/components/topBar/topBar";
import Logo from '@/public/img/tabi-logo.svg';
import Image from 'next/image';


export default function DashboardLayout(props:
    {
        children: React.ReactNode,
        content: React.ReactNode
    }) {


    return (
        <div className="h-screen overflow-y-hidden">

            <div className="h-full w-full flex flex-row">
                <div className="hidden lg:flex flex-col w-1/6 h-full pt-4 px-2 gap-8 bg-green-300/50">
                    <div className='hidden lg:flex mx-2 lg:mx-6 my-2'>
                        <Image src={Logo} alt="Tabi Logo" height={40} />
                    </div>
                    <NavBar />
                </div>
                <div className="w-full lg:w-5/6 overflow-y-auto">
                    <TopBar />
                    {props.content}
                </div>
            </div>



        </div>
    );
}