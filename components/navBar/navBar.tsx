import { HoldSeeds, Leaves, SettingTwo } from "@icon-park/react";
import { Menu, Skeleton } from "antd";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function NavBar() {
    const router = useRouter();
    const pathname = usePathname();

    const [currentActive, setCurrentActive] = useState<string>();

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

    useEffect(() => {
        const current = menuItems.find(item => pathname.includes(item.url));
        setCurrentActive(current?.key || '-1');
    }, [])

    return (
        currentActive
            ? <Menu
                defaultSelectedKeys={['1']}
                selectedKeys={[currentActive]}
                style={{ backgroundColor: 'rgb(173 230 121 / 0.00)', borderRightWidth: 0 }}
                defaultOpenKeys={['sub1']}
                mode="inline"
                className="h-full shadow-lg"
            >
                {menuItems.map(item => (
                    <Menu.Item
                        key={item.key}
                        className="flex items-center group py-6"
                        onClick={() => {
                            setCurrentActive(item.key);
                            router.push('/dashboard' + item.url)
                        }} >
                        <div className="flex gap-3 items-center">
                            {item.icon}
                            <span className={`text-base pt-0.5 ${currentActive === item.key ? 'font-bold' : 'font-medium'}`}>{item.title}</span>
                        </div>
                    </Menu.Item>
                ))}
            </Menu>
            : <div className="w-full p-2 flex flex-col flex-1 gap-1">
                <Skeleton.Button active block size="large" style={{padding : '1.4rem', borderRadius: '.65rem'}} />
                <Skeleton.Button active block size="large" style={{padding : '1.4rem', borderRadius: '.65rem'}} />
                <Skeleton.Button active block size="large" style={{padding : '1.4rem', borderRadius: '.65rem'}} />
            </div>
    )
}