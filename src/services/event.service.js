import axios from 'axios';

const API_URL = 'http://localhost:7001';

export const eventService = {
    async createEvent(eventData) {
        const formData = new FormData();

        // 添加基本字段
        Object.keys(eventData).forEach(key => {
            if (key !== 'eventImage') {
                formData.append(key, eventData[key]);
            }
        });

        // 添加图片
        if (eventData.eventImage) {
            formData.append('eventImage', eventData.eventImage);
        }

        const response = await axios.post(`${API_URL}/event/create`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }
};