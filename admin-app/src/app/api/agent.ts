import axios, { AxiosError, AxiosResponse } from 'axios';
import { Activity, ActivityFormValues } from '../models/activity';
import { toast } from 'react-toastify';
import { router } from '../router/Routes';
import { store } from '../stores/store';
import { User, UserFormValues } from '../models/user';
import { Photo, Profile, UserActivity } from '../models/profile';
import { PaginatedResult } from '../models/pagination';
import { Statistics } from '../models/statistics';


const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    })
}

axios.defaults.baseURL = 'http://localhost:5000/api';

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
})

axios.interceptors.response.use(async response => {
    await sleep(1000);
    const pagination = response.headers['pagination'];
    if (pagination) {
        response.data = new PaginatedResult(response.data, JSON.parse(pagination));
        return response as AxiosResponse<PaginatedResult<unknown>>;
    }
    return response;
}, (error: AxiosError) => {
    const { data, status, config } = error.response as AxiosResponse;
    switch (status) {
        case 400:
            if (config.method === 'get' && Object.prototype.hasOwnProperty.call(data.errors, 'id')) {
                router.navigate('/not-found');
            }
            if (data.errors) {
                const modalStateErrors = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modalStateErrors.push(data.errors[key])
                    }
                }
                throw modalStateErrors.flat();
            } else {
                toast.error(data);
            }
            break;
        case 401:
            toast.error('unauthorised')
            break;
        case 403:
            toast.error('forbidden')
            break;
        case 404:
            router.navigate('/not-found');
            break;
        case 500:
            store.commonStore.setServerError(data);
            router.navigate('/server-error');
            break;
    }
    return Promise.reject(error);
})

const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: object) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: object) => axios.put<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody)
}

const Activities = {
    list: (params: URLSearchParams) => axios.get<PaginatedResult<Activity[]>>(`/activities`, { params }).then(responseBody),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (activity: ActivityFormValues) => requests.post<void>(`/activities`, activity),
    update: (activity: ActivityFormValues) => requests.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.del<void>(`/activities/${id}`),
    deleteWithoutAuth: (id: string) => axios.delete<void>(`/activities/delete/${id}`).then(responseBody),
    attend: (id: string) => requests.post<void>(`/activities/${id}/attend`, {}),
    rate: (id: string, value: number) => requests.post<void>(`/activities/${id}/rate`, { value }),
    purchaseTicket: (activityId: string) => 
        requests.post<void>(`/activities/${activityId}/tickets`, {}),
    makePayment: () => axios.post<void>(`/activities/payments`, {}),
    search: (searchTerm: string, params: URLSearchParams) =>
        axios.get<PaginatedResult<Activity[]>>(`/activities/search?searchTerm=${searchTerm}`, { params }).then(responseBody),
    checkIfUserHasPurchasedTicket: (activityId: string) =>
        axios.get<boolean>(`/activities/${activityId}/has-purchased`).then(responseBody)
}


const Payments = {
    createPaymentIntent: () => requests.post('payments', {}),
    /* makePayment: () => requests.post('payment',{}) */
}
const Account = {
    current: () => requests.get<User>('/account'),
    login: (user: UserFormValues) => requests.post<User>('/account/login', user),
    register: (user: UserFormValues) => requests.post<User>('/account/register', user),
    verifyEmail: (token: string, email: string) => 
        requests.post<void>(`/account/verifyEmail?token=${token}&email=${email}`, {}),
    resendEmailConfirm: (email: string) => 
        requests.get(`/account/resendEmailConfirmationLink?email=${email}`),
    forgotPassword: (email: string) => 
        requests.post<void>(`/account/forgotPassword?email=${email}`, {}),
    resetPassword: (token: string, email: string, newPassword: string) =>
        requests.post<void>(`/account/resetPassword?token=${token}&email=${email}&newPassword=${newPassword}`, {}),
    listUsers: () => requests.get<User[]>('/account/listUsers'),
    banUser: (user: User) => requests.post<void>('/account/banUser', user),
    unbanUser: (user: User) => requests.post<void>('/account/unbanUser', user),
}



const StatisticsAPI = {
    getStatistics: () => requests.get<Statistics>('/statistics')
};

const Profiles = {
    get: (username: string) => requests.get(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {
        const formData = new FormData();
        formData.append('File', file);
        return axios.post<Photo>(`photos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => requests.del(`/photos/${id}`),
    updateProfile: (profile: Partial<Profile>) => requests.put(`/profiles`, profile),
    updateFollowing: (username: string) => requests.post(`/follow/${username}`, {}),
    listFollowings: (username: string, predicate: string) => requests
        .get<Profile[]>(`/follow/${username}?predicate=${predicate}`),
    listActivities: (username: string, predicate: string) =>
        requests.get<UserActivity[]>(`/profiles/${username}/activities?predicate=${predicate}`)
}

const agent = {
    Activities,
    Account,
    Profiles,
    Payments,
    StatisticsAPI
}

export default agent;
