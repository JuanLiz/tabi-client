'use client'

import TopBar from "@/components/topBar/topBar";
import Logo from '@/public/img/tabi-logo.svg';
import { HoldSeeds, Leaves, SettingTwo } from "@icon-park/react";
import { Menu } from "antd";
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { useState } from "react";

export default function DashboardLayout(props:
    {
        children: React.ReactNode,
        content: React.ReactNode
    }) {

    const router = useRouter();
    const pathname = usePathname();

    const [currentActive, setCurrentActive] = useState<string>('1');
    const menuItems = [
        {
            key: '1',
            icon: <Leaves theme="outline" size="20" fill="#412F26" className="" />,
            title: 'Cultivos',
            url: '/crops'
        },
        {
            key: '2',
            icon: <HoldSeeds theme="outline" size="20" fill="#412F26" className="" />,
            title: 'Cosechas',
            url: '/harvests'
        },
        {
            key: '3',
            icon: <SettingTwo theme="outline" size="20" fill="#412F26" className="" />,
            title: 'Configuración',
            url: '/settings'
        }
    ]


    return (
        <div className="h-screen overflow-y-hidden">

            <div className="h-full w-full flex flex-row">
                <div className="hidden lg:flex flex-col w-1/6 h-full pt-4 px-2 gap-8 bg-green-300/50">
                    <div className='hidden lg:flex mx-2 lg:mx-6 my-2'>
                        <Image src={Logo} alt="Tabi Logo" height={40} />
                    </div>
                    <Menu
                        defaultSelectedKeys={['1']}
                        style={{ backgroundColor: 'rgb(173 230 121 / 0.00)', borderRightWidth: 0 }}
                        defaultOpenKeys={['sub1']}
                        mode="inline"
                        className="h-full shadow-lg"
                    >
                        {menuItems.map(item => (
                            <Menu.Item key={item.key} className="flex items-center group py-6" onClick={() => { setCurrentActive(item.key); router.push('/dashboard' + item.url) }} >
                                <div className="flex gap-3 items-center">
                                    {item.icon}
                                    <span className={`text-base pt-0.5 ${currentActive === item.key ? 'font-bold' : 'font-medium'}`}>{item.title}</span>
                                </div>
                            </Menu.Item>
                        ))}
                    </Menu>
                </div>
                <div className="w-full lg:w-5/6 ">
                    <TopBar />
                    {props.content}
                </div>
            </div>



        </div>
    );
}