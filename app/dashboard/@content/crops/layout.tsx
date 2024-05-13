export default function CropsLayout(props: { children: React.ReactNode }) {
    return (
        <div className="w-full p-8 lg:px-9 lg:py-10">
            {props.children}
        </div>
    )
}