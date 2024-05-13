export default function CropsIdPage({ params }: { params: { id: string } }) {

    const CropId = params.id;

    return <p>{CropId}</p>;
}