import TopBar from "@/components/topBar/topBar";

export default function SettingsAltLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col">

            <TopBar />
            <div className="max-w-screen-xl mx-auto md:py-10">
                {children}
            </div>
        </div >
    )
}