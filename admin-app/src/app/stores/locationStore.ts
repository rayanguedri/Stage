// locationStore.ts
import { makeAutoObservable } from 'mobx';

export default class LocationStore {
    userLocation: { latitude: number; longitude: number } | null = null;

    constructor() {
        makeAutoObservable(this);
        this.getUserLocation();
    }

    getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.setUserLocation(position.coords.latitude, position.coords.longitude);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    setUserLocation = (latitude: number, longitude: number) => {
        this.userLocation = { latitude, longitude };
    };
}
