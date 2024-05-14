export default function CropsLayout(props: { children: React.ReactNode }) {
    return (
        <div className="w-full p-5 md:px-9 md:py-10">
            {props.children}
        </div>
    )
}