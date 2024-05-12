import TopBar from "@/components/topBar/topBar";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col">

            <TopBar />
            {children}
        </div >
    )
}