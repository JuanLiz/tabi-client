import axiosInstance from "@/axiosInterceptor";
import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";

export default function AddCropModal({ lot, visible, setVisible, setIsCropAdded }
    : {
        lot: LotResponse | undefined,
        visible: boolean,
        setVisible: React.Dispatch<React.SetStateAction<boolean>>,
        setIsCropAdded: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [cropTypes, setCropTypes] = useState<CropType[]>();
    const [cropStates, setCropStates] = useState<CropState[]>();

    const [addCropForm] = Form.useForm();
    const [addCropButtonLoading, setAddCropButtonLoading] = useState(false);
    const [plantingDate, setPlantingDate] = useState<Date>();

    //== API Methods ==//
    const getCropTypes = async () => {
        try {
            const response = await axiosInstance.get('/api/CropType');
            setCropTypes(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const getCropStates = async () => {
        try {
            const response = await axiosInstance.get('/api/CropState');
            setCropStates(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const addCrop = async (values: any) => {

        if (!lot) return;
        setAddCropButtonLoading(true);

        const form: FormData = new FormData();
        form.append('LotID', lot.lotID.toString());
        form.append('Hectares', values.hectares);
        form.append('PlantingDate', values.plantingDate.format('YYYY-MM-DD'));
        form.append('CropTypeID', values.cropTypeID);
        form.append('CropStateID', '1');

        try {
            const response = await axiosInstance.post('/api/Crop', form);
            console.log(response);
        } catch (error) {
            console.error(error);
        } finally {
            setAddCropButtonLoading(false);
            handleCancel();
            setIsCropAdded(true);
        }
    }

    const handleCancel = () => {
        setVisible(false);
    }

    const onAddCropFinish = async (values: any) => {
        addCrop(values);
    }

    useEffect(() => {
        getCropTypes();
        getCropStates();
    }, []);


    return (
        <Modal
            title={`Agregar cultivo a Lote ${lot?.name}`}
            open={visible}
            footer={null}
            onCancel={handleCancel}
        >
            <Form
                form={addCropForm}
                layout="vertical"
                onFinish={onAddCropFinish}
                style={{ margin: '1rem' }}
            >
                <div className='md:flex w-full gap-5'>
                    <Form.Item className='md:w-1/2' label="Hectáreas" name="hectares" rules={[{ required: true, message: 'Ingresa las hectáreas' }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item className='md:w-1/2' label="Fecha de siembra" name="plantingDate" rules={[{ required: true, message: 'Selecciona la fecha de siembra' }]}>
                        <DatePicker
                            format="DD/MM/YYYY"
                            className="w-full"
                            placeholder="Selecciona la fecha"   
                        />
                    </Form.Item>
                </div>
                <Form.Item label="Variedad de café" name="cropTypeID" rules={[{ required: true, message: 'Selecciona la variedad del café sembrado' }]}>
                    <Select
                        loading={cropTypes === undefined}
                        disabled={cropTypes === undefined}
                        placeholder="Selecciona la variedad">
                        {
                            cropTypes?.map(crop => (
                                <Select.Option key={crop.name} value={crop.cropTypeID}>{crop.name}</Select.Option>
                            ))
                        }
                    </Select>
                </Form.Item>
                <div className="w-full flex justify-end gap-2 pt-2">
                    <Button type="default" onClick={handleCancel}>Cancelar</Button>
                    <Button type="primary" htmlType="submit" loading={addCropButtonLoading}>Enviar</Button>
                </div>
            </Form>
        </Modal>
    );
}