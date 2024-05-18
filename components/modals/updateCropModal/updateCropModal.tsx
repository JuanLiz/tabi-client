import axiosInstance from "@/axiosInterceptor";
import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function UpdateCropModal({ crop, visible, setVisible, setIsCropUpdated }
    : {
        crop: CropResponse | undefined,
        visible: boolean,
        setVisible: React.Dispatch<React.SetStateAction<boolean>>,
        setIsCropUpdated: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const [cropTypes, setCropTypes] = useState<CropType[]>();
    const [cropStates, setCropStates] = useState<CropState[]>();

    const [updateCropForm] = Form.useForm();
    const [updateCropButtonLoading, setUpdateCropButtonLoading] = useState(false);

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
            // Remove the 'Cosechado' state
            setCropStates(response.data.filter((state: CropState) => state.name !== 'Cosechado'));
        } catch (error) {
            console.error(error);
        }
    }

    const updateCrop = async (values: any) => {

        if (!crop) return;
        setUpdateCropButtonLoading(true);

        const form: FormData = new FormData();
        form.append('CropID', crop.cropID.toString());
        form.append('Hectares', values.hectares);
        form.append('PlantingDate', values.plantingDate.format('YYYY-MM-DD'));
        form.append('CropTypeID', values.cropTypeID);
        form.append('CropStateID', values.cropStateID);

        try {
            const response = await axiosInstance.put('/api/Crop', form);
            if (response.status === 200) {
                setIsCropUpdated(true);
                updateCropForm.resetFields();
            }

        } catch (error) {
            console.error(error);
        } finally {
            setUpdateCropButtonLoading(false);
            handleCancel();
        }
    }

    const handleCancel = () => {
        setVisible(false);
    }

    const onUpdateCropFinish = async (values: any) => {
        updateCrop(values);
    }

    useEffect(() => {
        if (crop) {
            updateCropForm.setFieldsValue({
                hectares: crop.hectares,
                plantingDate: dayjs(crop.plantingDate),
                cropTypeID: crop.cropTypeID,
                cropStateID: crop.cropStateID
            });
        }
        getCropTypes();
        getCropStates();
    }, []);

    useEffect(() => {
        if (crop) {
            updateCropForm.setFieldsValue({
                hectares: crop.hectares,
                plantingDate: dayjs(crop.plantingDate),
                cropTypeID: crop.cropTypeID,
                cropStateID: crop.cropStateID
            });
        }
    }, [crop]);


    return (
        <Modal
            title={`Editar cultivo`}
            open={visible}
            footer={null}
            onCancel={handleCancel}
        >
            <Form
                form={updateCropForm}
                layout="vertical"
                onFinish={onUpdateCropFinish}
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
                            maxDate={dayjs(new Date().toISOString().split('T')[0], 'YYYY-MM-DD')}
                        />
                    </Form.Item>
                </div>
                <Form.Item label="Estado del cultivo" name="cropStateID" rules={[{ required: true, message: 'Selecciona el estado del cultivo' }]}>
                    <Select
                        loading={cropStates === undefined}
                        disabled={cropStates === undefined}
                        placeholder="Selecciona el estado">
                        {
                            cropStates?.map(state => (
                                <Select.Option key={state.name} value={state.cropStateID}>{state.name}</Select.Option>
                            ))
                        }
                    </Select>
                </Form.Item>
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
                    <Button type="primary" htmlType="submit" loading={updateCropButtonLoading}>Enviar</Button>
                </div>
            </Form>
        </Modal>
    );
}