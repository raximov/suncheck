import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

export const fetchBuildings = async (projectId: string, bbox: string) => {
    const response = await api.get(`/projects/${projectId}/buildings/`, { params: { bbox } });
    return response.data;
};

export const analyzeShadow = async (projectId: string, date: string, time: string) => {
    const response = await api.post(`/engine/shadow/`, { project_id: projectId, date, time });
    return response.data;
};

export const animateShadow = async (projectId: string, date: string, timeStart: string, timeEnd: string, interval: number) => {
    const response = await api.post(`/engine/shadow/animate/`, { project_id: projectId, date, time_start: timeStart, time_end: timeEnd, interval });
    return response.data;
};

export const analyzeInsolation = async (projectId: string, date: string, points: any) => {
    const response = await api.post(`/engine/insolation/`, { project_id: projectId, date, points });
    return response.data;
};

export const fetchOsmBuildings = async (projectId: string, bbox: string) => {
    const response = await api.post(`/projects/${projectId}/buildings/fetch_osm/`, { bbox });
    return response.data;
};

export default api;
